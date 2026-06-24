/**
 * Flow actions: driving the multi-step flow state machine.
 */
import type { Action } from '../action.js';
export interface FlowStartAction {
    readonly type: 'flow.start';
    readonly params: {
        readonly routeId: string;
        readonly params?: Readonly<Record<string, unknown>>;
    };
}
export interface FlowAdvanceAction {
    readonly type: 'flow.advance';
    readonly params?: {
        readonly routeId?: string;
    };
}
export interface FlowGoToAction {
    readonly type: 'flow.goTo';
    readonly params: {
        readonly routeId?: string;
        readonly stepId: string;
    };
}
export interface FlowResumeAction {
    readonly type: 'flow.resume';
    readonly params?: {
        readonly routeId?: string;
    };
}
export interface FlowAbortAction {
    readonly type: 'flow.abort';
    readonly params?: {
        readonly routeId?: string;
        readonly reason?: string;
    };
}
export interface FlowCompleteAction {
    readonly type: 'flow.complete';
    readonly params?: {
        readonly routeId?: string;
    };
}
export declare function isFlowAction(action: Action): action is FlowStartAction | FlowAdvanceAction | FlowGoToAction | FlowResumeAction | FlowAbortAction | FlowCompleteAction;
//# sourceMappingURL=flow.d.ts.map