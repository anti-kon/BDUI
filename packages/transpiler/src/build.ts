import fs from 'node:fs';
import path from 'node:path';

import { validateContract } from '@bdui/schema';

import { bundleEntry, removeBundleArtifacts } from './bundle.js';
import { explainValidationErrors, formatDiagnostics } from './diagnostics.js';
import { loadContractFromBundle } from './load.js';
import { serializeContract } from './serialize.js';
import { type BuildOptions, type BuildResult, TranspileError } from './types.js';

export async function buildContract(opts: BuildOptions): Promise<BuildResult> {
  const cwd = opts.cwd ?? process.cwd();
  const entryAbs = path.resolve(cwd, opts.entry);

  if (!fs.existsSync(entryAbs)) {
    throw new TranspileError(
      `Entry "${opts.entry}" does not exist (resolved to ${entryAbs}).`,
      opts.entry,
    );
  }

  const bundle = await bundleEntry(entryAbs, opts, cwd);

  try {
    const contract = await loadContractFromBundle(bundle.outfile, opts.entry);

    if (opts.validate !== false) {
      const { ok, errors } = validateContract(contract);
      if (!ok) {
        const diags = await explainValidationErrors(errors, bundle.sourcemap);
        throw new TranspileError(
          `Schema validation failed for ${opts.entry}:\n${formatDiagnostics(diags)}`,
          opts.entry,
          errors,
        );
      }
    }

    const json = serializeContract(contract, opts.mode);

    if (opts.outFile) {
      const outAbs = path.resolve(cwd, opts.outFile);
      fs.mkdirSync(path.dirname(outAbs), { recursive: true });
      fs.writeFileSync(outAbs, json, 'utf-8');
    }

    const result: BuildResult = { contract, json };
    if (bundle.sourcemap && opts.emitSourceMap) {
      result as unknown as { sourceMap?: string };
      (result as { sourceMap?: string }).sourceMap = fs.readFileSync(bundle.sourcemap, 'utf-8');
    }
    return result;
  } finally {
    removeBundleArtifacts(bundle, opts.keepIntermediate === true);
  }
}
