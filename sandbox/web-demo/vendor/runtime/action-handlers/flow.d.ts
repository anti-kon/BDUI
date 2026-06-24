import type { FlowAbortAction, FlowAdvanceAction, FlowCompleteAction, FlowGoToAction, FlowResumeAction, FlowStartAction } from '@bdui/core';
import type { ActionContext } from './context.js';
export declare function handleFlowStart(ctx: ActionContext, action: FlowStartAction): void;
export declare function handleFlowAdvance(ctx: ActionContext, action: FlowAdvanceAction): void;
export declare function handleFlowGoTo(ctx: ActionContext, action: FlowGoToAction): void;
export declare function handleFlowResume(ctx: ActionContext, action: FlowResumeAction): void;
export declare function handleFlowAbort(ctx: ActionContext, action: FlowAbortAction): void;
export declare function handleFlowComplete(ctx: ActionContext, action: FlowCompleteAction): void;
//# sourceMappingURL=flow.d.ts.map