import type { ExprRef, Scope, StateTarget } from '@bdui/core';
import { exprRef, isExprRef } from '@bdui/core';

import { isStateVar, type StateVar } from './state.js';

/** Targetable reference — string like "flow.counter", StateVar, or explicit. */
export type Target = string | StateTarget | StateVar<unknown>;

const SCOPES: readonly Scope[] = ['local', 'session', 'flow'];

function isScope(v: unknown): v is Scope {
  return typeof v === 'string' && (SCOPES as readonly string[]).includes(v);
}

function ensurePath(path: unknown): string {
  if (typeof path !== 'string' || !path.trim()) {
    throw new Error('Target path must be a non-empty string');
  }
  return path;
}

export function parseTarget(target: Target): StateTarget {
  if (typeof target === 'string') {
    const idx = target.indexOf('.');
    if (idx < 0) throw new Error(`Invalid string target: "${target}"`);
    const scope = target.slice(0, idx);
    const path = target.slice(idx + 1);
    if (!isScope(scope)) throw new Error(`Unsupported scope: "${scope}"`);
    return { scope, path: ensurePath(path) };
  }
  if (isStateVar(target)) {
    return { scope: target.scope, path: target.path };
  }
  const scope = (target as { scope?: unknown }).scope;
  const path = (target as { path?: unknown }).path;
  if (!isScope(scope)) throw new Error(`Unsupported scope: "${String(scope)}"`);
  return { scope, path: ensurePath(path) };
}

export function ensureExprRef(value: unknown): ExprRef {
  if (isExprRef(value)) return value;
  if (typeof value === 'string') return exprRef(value);
  throw new Error('Expected an expression reference or a string expression');
}
