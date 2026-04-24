import { type RuntimeStateLike } from '@bdui/core';
import type { ExprNode } from './ast.js';
import { type BuiltinFn } from './builtins.js';
export interface EvalContext {
    readonly flow: Readonly<Record<string, unknown>>;
    readonly session: Readonly<Record<string, unknown>>;
    readonly local: Readonly<Record<string, unknown>>;
    readonly params: Readonly<Record<string, unknown>>;
    readonly builtins?: Readonly<Record<string, BuiltinFn>>;
}
export declare function buildContext(state: RuntimeStateLike, params?: Record<string, unknown>): EvalContext;
export declare function evaluate(node: ExprNode, ctx: EvalContext): unknown;
//# sourceMappingURL=interpret.d.ts.map