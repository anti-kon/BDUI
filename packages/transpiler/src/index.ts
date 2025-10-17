import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { validateContract } from '@bdui/schema';
import { build } from 'esbuild';

type BuildOpts = {
  entry: string;
  outFile?: string;
  mode?: 'dev' | 'prod';
  withSourceLinks?: boolean;
};

export async function buildContract(opts: BuildOpts) {
  const entryAbs = path.resolve(process.cwd(), opts.entry);
  const outfile = path.join(path.dirname(entryAbs), '.bdui-build.mjs');

  await build({
    entryPoints: [entryAbs],
    outfile,
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node22',
    jsx: 'automatic',
    jsxImportSource: '@bdui/dsl',
    define: {
      'process.env.NODE_ENV': JSON.stringify(opts.mode === 'prod' ? 'production' : 'development'),
    },
    minify: false,
    sourcemap: opts.mode === 'dev',
  });

  const modUrl = pathToFileURL(outfile).href;
  const mod = await import(modUrl);
  const contract: any =
    (mod as any).default ?? (mod as any).contract ?? (mod as any).CONTRACT ?? mod;

  const { ok, errors } = validateContract(contract);
  if (!ok) {
    const errText = (errors || [])
      .map((e: any) => `${e.instancePath || '(root)'}: ${e.message}`)
      .join('\n');
    throw new Error(`Schema validation failed:\n${errText}`);
  }

  const json = JSON.stringify(contract, null, opts.mode === 'prod' ? 0 : 2);
  if (opts.outFile) {
    fs.writeFileSync(path.resolve(process.cwd(), opts.outFile), json, 'utf-8');
  }
  try {
    fs.unlinkSync(outfile);
  } catch {}
  return { json, contract };
}
