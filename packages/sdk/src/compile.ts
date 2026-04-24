import type { Contract } from '@bdui/core';
import { buildContract, type BuildOptions, type BuildResult } from '@bdui/transpiler';

export interface CompileOptions extends BuildOptions {}

export interface CompileResult {
  readonly contract: Contract;
  readonly raw: BuildResult;
}

/** Programmatic alternative to the CLI `build` command. */
export async function compileContract(options: CompileOptions): Promise<CompileResult> {
  const result = await buildContract(options);
  return { contract: result.contract as Contract, raw: result };
}
