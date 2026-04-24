import { type ExprRef, type RuntimeStateLike } from '@bdui/core';
import type { ExprNode } from './ast.js';
import { type EvalContext } from './interpret.js';
import { type ExprLimits } from './limits.js';
/** Compiled, cacheable expression. */
export interface CompiledExpr {
    readonly source: string;
    readonly ast: ExprNode;
    evaluate(ctx: EvalContext): unknown;
}
export declare function compile(source: string, limits?: ExprLimits): CompiledExpr;
export declare function clearCompileCache(): void;
/** Evaluate an expression source in a given state. */
export declare function evalExpression(source: string, state: RuntimeStateLike, params?: Record<string, unknown>, limits?: ExprLimits): unknown;
/** Evaluate an ExprRef. */
export declare function evalExprRef(ref: ExprRef, state: RuntimeStateLike, params?: Record<string, unknown>): unknown;
/** Process a string that may contain `{{expression}}` placeholders. */
export declare function interpolate(template: string, state: RuntimeStateLike, params?: Record<string, unknown>): string;
/**
 * If the given value is a plain `{{...}}` string, evaluate it and return the
 * raw result (preserving type); otherwise return the original value.
 */
export declare function resolveValue(value: unknown, state: RuntimeStateLike, params?: Record<string, unknown>): unknown;
//# sourceMappingURL=compile.d.ts.map