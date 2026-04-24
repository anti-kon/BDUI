import { type Unsubscribe } from './events.js';
export interface ModalEventMap {
    open: {
        readonly id: string;
    };
    close: {
        readonly id: string;
    };
}
export interface ModalController {
    open(id: string): void;
    close(id: string): void;
    isOpen(id: string): boolean;
    readonly openIds: readonly string[];
    on<K extends keyof ModalEventMap>(event: K, listener: (payload: ModalEventMap[K]) => void): Unsubscribe;
}
export declare function createModalController(): ModalController;
//# sourceMappingURL=modal.d.ts.map