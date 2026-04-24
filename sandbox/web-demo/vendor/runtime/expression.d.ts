import type { Expression, ExprRef, RuntimeStateLike } from '@bdui/core';
/** Evaluate an `Expression<T>` (either literal `T` or `ExprRef`). */
export declare function evaluate<T>(value: Expression<T> | string, state: RuntimeStateLike): T | undefined;
export declare function interpolateTemplate(template: string, state: RuntimeStateLike): string;
export declare function evaluateGuard(expr: string | ExprRef, state: RuntimeStateLike): boolean;
//# sourceMappingURL=expression.d.ts.map