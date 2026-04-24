import fs from 'node:fs';
import path from 'node:path';

import { build, type BuildOptions as EsbuildOptions } from 'esbuild';

import type { BuildOptions } from './types.js';

export interface BundleOutcome {
  readonly outfile: string;
  readonly sourcemap?: string;
}

/** Hidden file name pattern used for intermediate ESM bundles. */
const INTERMEDIATE_PREFIX = '.bdui-build-';
const INTERMEDIATE_SUFFIX = '.mjs';

/** Build a unique intermediate filename per entry to avoid collisions. */
export function intermediatePath(entryAbs: string, cwd: string): string {
  const rel = path.relative(cwd, entryAbs).replace(/[\\/.]/g, '_');
  const stamp = `${process.pid}_${Date.now().toString(36)}`;
  return path.join(
    path.dirname(entryAbs),
    `${INTERMEDIATE_PREFIX}${rel}_${stamp}${INTERMEDIATE_SUFFIX}`,
  );
}

export async function bundleEntry(
  entryAbs: string,
  opts: BuildOptions,
  cwd: string,
): Promise<BundleOutcome> {
  const outfile = intermediatePath(entryAbs, cwd);
  const esbuildOpts: EsbuildOptions = {
    entryPoints: [entryAbs],
    outfile,
    absWorkingDir: cwd,
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node22',
    jsx: 'automatic',
    jsxImportSource: opts.jsxImportSource ?? '@bdui/dsl',
    define: {
      'process.env.NODE_ENV': JSON.stringify(opts.mode === 'prod' ? 'production' : 'development'),
    },
    minify: false,
    sourcemap: (opts.emitSourceMap ?? opts.mode !== 'prod') ? 'linked' : false,
    sourcesContent: true,
    logLevel: 'silent',
  };

  await build(esbuildOpts);

  const sourcemapFile = `${outfile}.map`;
  const result: BundleOutcome = { outfile };
  if (fs.existsSync(sourcemapFile)) {
    return { ...result, sourcemap: sourcemapFile };
  }
  return result;
}

export function removeBundleArtifacts(bundle: BundleOutcome, keep: boolean): void {
  if (keep) return;
  const files = [bundle.outfile, bundle.sourcemap].filter(
    (value): value is string => typeof value === 'string',
  );
  for (const file of files) {
    try {
      fs.rmSync(file, { force: true });
    } catch {
      /* ignore cleanup failures — best effort. */
    }
  }
}
