import type { Expression, ExprRef, RuntimeStateLike } from '@bdui/core';
import { isExprRef } from '@bdui/core';
import { evalExpression, evalExprRef, interpolate, resolveValue } from '@bdui/expr';

/** Evaluate an `Expression<T>` (either literal `T` or `ExprRef`). */
export function evaluate<T>(value: Expression<T> | string, state: RuntimeStateLike): T | undefined {
  if (isExprRef(value)) return evalExprRef(value, state) as T;
  if (typeof value === 'string') {
    const raw = resolveValue(value, state);
    if (typeof raw === 'string' && raw === value && /\{\{.+\}\}/.test(value)) {
      return interpolate(value, state) as unknown as T;
    }
    return raw as T;
  }
  return value as T;
}

export function interpolateTemplate(template: string, state: RuntimeStateLike): string {
  return interpolate(template, state);
}

export function evaluateGuard(expr: string | ExprRef, state: RuntimeStateLike): boolean {
  try {
    if (typeof expr === 'string') {
      return !!evalExpression(expr, state);
    }
    return !!evalExprRef(expr, state);
  } catch {
    return false;
  }
}
