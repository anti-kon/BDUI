import type { FlowRouteScreen, FlowStep, FlowTransition, RuntimeStateLike } from '@bdui/core';
export declare function evaluateGuard(transition: FlowTransition, state: RuntimeStateLike): boolean;
/**
 * Resolve the next flow step given current state and the starting step id.
 * If any transition guard evaluates to truthy, the first matching target
 * becomes the next step; otherwise the starting step is returned unchanged.
 */
export interface FlowResolution {
    readonly step: FlowStep;
    readonly stepId: string;
}
export declare function resolveFlowStep(route: FlowRouteScreen, state?: RuntimeStateLike, currentStepId?: string): FlowResolution;
/** Helper used by builders to produce a guard from a source string or ExprRef. */
export declare function asGuardExpr(value: string | {
    code: string;
} | undefined): {
    __bduiExpr: true;
    code: string;
} | undefined;
//# sourceMappingURL=flow.d.ts.map