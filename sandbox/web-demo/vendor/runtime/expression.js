import { isExprRef } from '@bdui/core';
import { evalExpression, evalExprRef, interpolate, resolveValue } from '@bdui/expr';
/** Evaluate an `Expression<T>` (either literal `T` or `ExprRef`). */
export function evaluate(value, state) {
    if (isExprRef(value))
        return evalExprRef(value, state);
    if (typeof value === 'string') {
        const raw = resolveValue(value, state);
        if (typeof raw === 'string' && raw === value && /\{\{.+\}\}/.test(value)) {
            return interpolate(value, state);
        }
        return raw;
    }
    return value;
}
export function interpolateTemplate(template, state) {
    return interpolate(template, state);
}
export function evaluateGuard(expr, state) {
    try {
        if (typeof expr === 'string') {
            return !!evalExpression(expr, state);
        }
        return !!evalExprRef(expr, state);
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=expression.js.map