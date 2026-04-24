import { type Expression, type ExprRef as CoreExprRef } from '@bdui/core';
export type Expr<T = unknown> = CoreExprRef & {
    readonly __brand?: T;
};
/** Author an expression. Aliased to `exprRef` from the core; kept for readability. */
export declare function E<T = unknown>(code: string): Expr<T>;
/** Convert a DSL value to its JSON wire representation. */
export declare function toJsonValue(v: unknown): unknown;
export type { Expression };
//# sourceMappingURL=expr.d.ts.map