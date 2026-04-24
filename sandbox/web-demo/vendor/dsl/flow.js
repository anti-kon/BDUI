import { decodeExpr } from '@bdui/core';
import { evalExpression } from '@bdui/expr';
export function evaluateGuard(transition, state) {
    if (!transition.guard)
        return true;
    try {
        const code = transition.guard.code;
        const result = evalExpression(code, state);
        return Boolean(result);
    }
    catch {
        return false;
    }
}
export function resolveFlowStep(route, state = {}, currentStepId) {
    const steps = route.steps ?? [];
    if (steps.length === 0) {
        throw new Error(`Flow route "${route.id}" has no steps defined.`);
    }
    const stepMap = new Map(steps.map((s) => [s.id, s]));
    const startId = currentStepId ?? route.startStep;
    let current = stepMap.get(startId);
    if (!current)
        throw new Error(`Step not found: "${startId}"`);
    for (const transition of current.transitions ?? []) {
        if (evaluateGuard(transition, state)) {
            const next = stepMap.get(transition.to);
            if (next)
                current = next;
            break;
        }
    }
    return { step: current, stepId: current.id };
}
/** Helper used by builders to produce a guard from a source string or ExprRef. */
export function asGuardExpr(value) {
    if (value == null)
        return undefined;
    if (typeof value === 'string') {
        const decoded = decodeExpr(value);
        return { __bduiExpr: true, code: decoded ?? value };
    }
    return { __bduiExpr: true, code: value.code };
}
//# sourceMappingURL=flow.js.map