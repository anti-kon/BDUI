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
export declare const EXPR_PATTERN: RegExp;
export declare function isExprRef(value: unknown): value is ExprRef;
export declare function exprRef(code: string): ExprRef;
/** Wire-format: serialize `ExprRef` into the `{{...}}` string. */
export declare function encodeExpr(ref: ExprRef): string;
/** Wire-format: detect and extract the code part of `{{...}}` strings. */
export declare function decodeExpr(value: unknown): string | null;
/** Value that may be either a literal `T` or an expression. */
export type Expression<T> = T | ExprRef;
//# sourceMappingURL=expr.d.ts.map