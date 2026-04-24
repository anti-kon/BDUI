import type { Contract } from '@bdui/core';

function sortedRecord<V>(record: Record<string, V>): Record<string, V> {
  const sorted: Record<string, V> = {};
  for (const key of Object.keys(record).sort()) {
    const value = record[key];
    if (value === undefined) continue;
    sorted[key] = value as V;
  }
  return sorted;
}

function deepStable(value: unknown): unknown {
  if (value === undefined) return undefined;
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(deepStable);
  const record = value as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(record).sort()) {
    const mapped = deepStable(record[key]);
    if (mapped === undefined) continue;
    sorted[key] = mapped;
  }
  return sorted;
}

/** Canonicalise a contract so that repeated builds produce byte-identical JSON. */
export function canonicalise(contract: Contract): Contract {
  const base = contract as unknown as Record<string, unknown>;
  const result: Record<string, unknown> = {
    meta: deepStable(base.meta),
  };
  if (base.theme !== undefined) {
    const themeStable = deepStable(base.theme);
    if (themeStable !== undefined) result.theme = themeStable;
  }
  if (base.initial !== undefined) {
    const initial = base.initial as { flow?: unknown; session?: unknown };
    const init: Record<string, unknown> = {};
    if (initial.flow !== undefined)
      init.flow = sortedRecord(initial.flow as Record<string, unknown>);
    if (initial.session !== undefined) {
      init.session = sortedRecord(initial.session as Record<string, unknown>);
    }
    if (Object.keys(init).length > 0) result.initial = init;
  }
  if (base.dataSources !== undefined) result.dataSources = deepStable(base.dataSources);
  if (base.navigation !== undefined) result.navigation = deepStable(base.navigation);
  for (const key of Object.keys(base).sort()) {
    if (['meta', 'theme', 'initial', 'dataSources', 'navigation'].includes(key)) continue;
    const mapped = deepStable(base[key]);
    if (mapped === undefined) continue;
    result[key] = mapped;
  }
  return result as unknown as Contract;
}

export function serializeContract(contract: Contract, mode: 'dev' | 'prod' | undefined): string {
  const canonical = canonicalise(contract);
  const indent = mode === 'prod' ? 0 : 2;
  const json = JSON.stringify(canonical, null, indent);
  return mode === 'prod' ? json : `${json}\n`;
}
