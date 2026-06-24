import type { ModalCloseAction, ModalOpenAction, PrefetchScreensAction, ToastAction } from '@bdui/core';
import type { ActionContext } from './context.js';
export declare function handleToast(ctx: ActionContext, action: ToastAction): void;
export declare function handleModalOpen(ctx: ActionContext, action: ModalOpenAction): void;
export declare function handleModalClose(ctx: ActionContext, action: ModalCloseAction): void;
export declare function handlePrefetch(ctx: ActionContext, action: PrefetchScreensAction): Promise<void>;
//# sourceMappingURL=feedback.d.ts.map