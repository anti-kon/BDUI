import type { Contract } from '@bdui/core';
import type { ErrorObject } from 'ajv/dist/2020.js';

export type BuildMode = 'dev' | 'prod';

export interface BuildOptions {
  readonly entry: string;
  readonly outFile?: string;
  readonly mode?: BuildMode;
  /** If true, emit a `<outFile>.map` file with inline source mapping metadata. */
  readonly emitSourceMap?: boolean;
  /** Absolute path to use as process cwd, defaults to `process.cwd()`. */
  readonly cwd?: string;
  /** Overrides the `@bdui/dsl` JSX import source (useful for local linking). */
  readonly jsxImportSource?: string;
  /** Runs schema validation on the resulting contract. Defaults to `true`. */
  readonly validate?: boolean;
  /** Internal: keep intermediate `.bdui-build.mjs` file, for debugging. */
  readonly keepIntermediate?: boolean;
}

export interface BuildResult {
  readonly contract: Contract;
  readonly json: string;
  readonly sourceMap?: string;
}

export class TranspileError extends Error {
  override readonly name = 'TranspileError';
  readonly issues: readonly ErrorObject[];
  readonly entry: string;

  constructor(message: string, entry: string, issues: readonly ErrorObject[] = []) {
    super(message);
    this.entry = entry;
    this.issues = issues;
  }
}
