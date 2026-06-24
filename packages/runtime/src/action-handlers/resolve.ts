import { isExprRef } from '@bdui/core';
import { evalExprRef, interpolate, resolveValue as resolveExpressionValue } from '@bdui/expr';

import type { RuntimeStateController } from '../state.js';

export function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/**
 * Deeply resolve expression references, `{{ }}` templates and plain values
 * against the current state snapshot. Arrays and plain objects are resolved
 * element-by-element.
 */
export function resolveValue(
  value: unknown,
  state: RuntimeStateController,
  params?: Record<string, unknown>,
): unknown {
  const snapshot = state.snapshot();
  if (value === null || value === undefined) return value;
  if (isExprRef(value)) return evalExprRef(value, snapshot, params);
  if (typeof value === 'string') {
    const raw = resolveExpressionValue(value, snapshot, params);
    if (typeof raw === 'string' && raw === value && /\{\{.+\}\}/.test(value)) {
      return interpolate(value, snapshot, params);
    }
    return raw;
  }
  if (Array.isArray(value)) return value.map((v) => resolveValue(v, state, params));
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(record)) out[k] = resolveValue(v, state, params);
    return out;
  }
  return value;
}
