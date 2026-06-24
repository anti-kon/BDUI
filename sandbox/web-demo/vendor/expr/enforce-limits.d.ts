import type { ExprNode } from './ast.js';
import type { ExprLimits } from './limits.js';
/**
 * Walk a parsed AST and reject trees that exceed the configured node-count or
 * nesting-depth limits. Run after parsing so untrusted expressions cannot blow
 * up the interpreter.
 */
export declare function enforceLimits(root: ExprNode, limits: ExprLimits): void;
//# sourceMappingURL=enforce-limits.d.ts.map