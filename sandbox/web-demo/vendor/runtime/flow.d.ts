import type { FlowRouteScreen, FlowStateHandle, FlowStep, RuntimeStateLike } from '@bdui/core';
import type { RuntimeStateController } from './state.js';
export interface FlowStepResolution {
    readonly step: FlowStep;
    readonly stepId: string;
    readonly matchedTransition?: {
        readonly to: string;
    };
    readonly createdStep: boolean;
}
/**
 * Resolve the active step of a flow: evaluates transitions' guards on the
 * current step and advances as far as possible.
 */
export declare function resolveFlowStep(route: FlowRouteScreen, state: RuntimeStateLike, currentStepId?: string): FlowStepResolution;
export interface FlowController {
    /**
     * Record/update a flow handle and return its identifier. Used for actions
     * like flow.start/resume to remember which flow is active.
     */
    activate(routeId: string, handle?: Partial<FlowStateHandle>): void;
    deactivate(routeId: string): void;
    getActive(routeId: string): Partial<FlowStateHandle> | undefined;
}
export declare function createFlowController(state: RuntimeStateController): FlowController;
//# sourceMappingURL=flow.d.ts.map