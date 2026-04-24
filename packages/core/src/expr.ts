/**
 * Expression reference in a contract.
 *
 * On the wire expressions are encoded as `{{expression}}` strings. In memory
 * during contract authoring they are wrapped in `ExprRef` markers so the DSL
 * can distinguish literal strings from expressions.
 */
export interface ExprRef {
  readonly __bduiExpr: true;
  readonly code: string;
}

export const EXPR_PATTERN = /^\{\{([\s\S]+)\}\}$/;

export function isExprRef(value: unknown): value is ExprRef {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { __bduiExpr?: unknown }).__bduiExpr === true &&
    typeof (value as { code?: unknown }).code === 'string'
  );
}

export function exprRef(code: string): ExprRef {
  if (typeof code !== 'string' || code.trim().length === 0) {
    throw new Error('ExprRef code must be a non-empty string');
  }
  return { __bduiExpr: true, code };
}

/** Wire-format: serialize `ExprRef` into the `{{...}}` string. */
export function encodeExpr(ref: ExprRef): string {
  return `{{${ref.code}}}`;
}

/** Wire-format: detect and extract the code part of `{{...}}` strings. */
export function decodeExpr(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const match = EXPR_PATTERN.exec(value);
  return match ? (match[1] ?? null) : null;
}

/** Value that may be either a literal `T` or an expression. */
export type Expression<T> = T | ExprRef;
