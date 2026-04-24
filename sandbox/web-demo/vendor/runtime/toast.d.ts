import { type Unsubscribe } from './events.js';
export interface ToastPayload {
    readonly id: string;
    readonly message: string;
    readonly level: 'info' | 'success' | 'warning' | 'error';
    readonly durationMs: number;
    readonly timestamp: number;
}
export interface ToastEventMap {
    show: ToastPayload;
    dismiss: {
        readonly id: string;
    };
}
export interface ToastController {
    show(args: {
        readonly message: string;
        readonly level?: 'info' | 'success' | 'warning' | 'error';
        readonly durationMs?: number;
    }): string;
    dismiss(id: string): void;
    readonly active: readonly ToastPayload[];
    on<K extends keyof ToastEventMap>(event: K, listener: (payload: ToastEventMap[K]) => void): Unsubscribe;
}
export declare function createToastController(): ToastController;
//# sourceMappingURL=toast.d.ts.map