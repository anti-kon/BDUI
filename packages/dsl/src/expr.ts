import { encodeExpr, type Expression, type ExprRef as CoreExprRef, exprRef } from '@bdui/core';

export type Expr<T = unknown> = CoreExprRef & { readonly __brand?: T };

/** Author an expression. Aliased to `exprRef` from the core; kept for readability. */
export function E<T = unknown>(code: string): Expr<T> {
  return exprRef(code) as Expr<T>;
}

/** Convert a DSL value to its JSON wire representation. */
export function toJsonValue(v: unknown): unknown {
  if (v && typeof v === 'object' && (v as { __bduiExpr?: unknown }).__bduiExpr === true) {
    return encodeExpr(v as CoreExprRef);
  }
  return v;
}

export type { Expression };
