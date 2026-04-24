import fs from 'node:fs';

import type { ErrorObject } from 'ajv/dist/2020.js';

interface RawSourceMap {
  readonly version: number;
  readonly sources: readonly string[];
  readonly file?: string;
}

export interface DiagnosticLine {
  readonly path: string;
  readonly message: string;
  readonly sourceLine?: number;
  readonly sourceColumn?: number;
  readonly sourceFile?: string;
}

function loadRawMap(sourceMapPath: string | undefined): RawSourceMap | null {
  if (!sourceMapPath) return null;
  try {
    const raw = fs.readFileSync(sourceMapPath, 'utf-8');
    return JSON.parse(raw) as RawSourceMap;
  } catch {
    return null;
  }
}

/**
 * Best-effort enrichment. We do not have precise AST-level line info for JSON
 * paths, but we can at least annotate each diagnostic with the source file
 * that produced the bundle so downstream tooling can hook in further.
 */
export async function explainValidationErrors(
  errors: readonly ErrorObject[],
  sourceMapPath?: string,
): Promise<readonly DiagnosticLine[]> {
  const rawMap = loadRawMap(sourceMapPath);
  return errors.map<DiagnosticLine>((error) => {
    const line: DiagnosticLine = {
      path: error.instancePath || '/',
      message: error.message ?? 'schema violation',
    };
    if (rawMap?.sources.length) {
      const firstSource = rawMap.sources[0];
      if (firstSource) return { ...line, sourceFile: firstSource };
    }
    return line;
  });
}

export function formatDiagnostics(diags: readonly DiagnosticLine[]): string {
  if (diags.length === 0) return '';
  return diags
    .map((d) => {
      const where = d.sourceFile ? `${d.sourceFile}::` : '';
      return `  ${where}${d.path} — ${d.message}`;
    })
    .join('\n');
}
