import type { ResetAction, SetAction, SyncAction, UpdateAppendAction, UpdateDecAction, UpdateIncAction, UpdateMapPathAction, UpdateMergeAction, UpdateToggleAction } from '@bdui/core';
import type { ActionContext } from './context.js';
export declare function handleSet(ctx: ActionContext, action: SetAction): void;
export declare function handleReset(ctx: ActionContext, action: ResetAction): void;
export declare function handleInc(ctx: ActionContext, action: UpdateIncAction): void;
export declare function handleDec(ctx: ActionContext, action: UpdateDecAction): void;
export declare function handleToggle(ctx: ActionContext, action: UpdateToggleAction): void;
export declare function handleAppend(ctx: ActionContext, action: UpdateAppendAction): void;
export declare function handleMerge(ctx: ActionContext, action: UpdateMergeAction): void;
export declare function handleMapPath(ctx: ActionContext, action: UpdateMapPathAction): void;
export declare function handleSync(ctx: ActionContext, _action: SyncAction): void;
//# sourceMappingURL=state.d.ts.map