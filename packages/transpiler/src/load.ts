import { pathToFileURL } from 'node:url';

import type { Contract } from '@bdui/core';

import { TranspileError } from './types.js';

interface Candidate {
  readonly contract?: unknown;
  readonly default?: unknown;
  readonly CONTRACT?: unknown;
}

function looksLikeContract(value: unknown): value is Contract {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.meta === 'object' &&
    record.meta !== null &&
    typeof record.navigation === 'object' &&
    record.navigation !== null
  );
}

export async function loadContractFromBundle(bundlePath: string, entry: string): Promise<Contract> {
  const url = `${pathToFileURL(bundlePath).href}?t=${Date.now()}`;
  const mod: Candidate = await import(url);
  const candidates: unknown[] = [mod.default, mod.contract, mod.CONTRACT];
  for (const candidate of candidates) {
    if (looksLikeContract(candidate)) return candidate;
  }
  if (looksLikeContract(mod)) return mod as unknown as Contract;
  throw new TranspileError(
    `Entry "${entry}" did not export a BDUI contract (expected default or named \`contract\`/\`CONTRACT\`).`,
    entry,
  );
}
