/**
 * Feedback and presentation actions: toasts, modals and screen prefetching.
 */
import type { Expression } from '../expr.js';
export type ToastLevel = 'info' | 'success' | 'warning' | 'error';
export interface ToastAction {
    readonly type: 'toast';
    readonly params: {
        readonly message: Expression<string>;
        readonly level?: ToastLevel;
        readonly durationMs?: number;
    };
}
export interface ModalOpenAction {
    readonly type: 'modal.open';
    readonly params: {
        readonly id: string;
    };
}
export interface ModalCloseAction {
    readonly type: 'modal.close';
    readonly params: {
        readonly id: string;
    };
}
export interface PrefetchScreensAction {
    readonly type: 'prefetchScreens';
    readonly params: {
        readonly screens: readonly string[];
    };
}
//# sourceMappingURL=feedback.d.ts.map