import type { BDUIElement, Contract } from '@bdui/core';
import { type ActionRunner, type StateValidator } from './actions.js';
import { type FlowController } from './flow.js';
import type { HttpClient } from './http.js';
import { type ModalController } from './modal.js';
import { type NavigationController } from './navigation.js';
import type { RendererPlugin } from './plugin.js';
import { type RuntimeStateController } from './state.js';
import type { StorageAdapter } from './storage.js';
import { type ToastController } from './toast.js';
export interface RuntimeOptions {
    readonly contract: Contract;
    readonly storage?: StorageAdapter;
    readonly http?: HttpClient;
    readonly validators?: Readonly<Record<string, StateValidator>>;
    readonly prefetchScreens?: (screens: readonly string[]) => Promise<void> | void;
}
export interface Runtime {
    readonly contract: Contract;
    readonly state: RuntimeStateController;
    readonly navigation: NavigationController;
    readonly toast: ToastController;
    readonly modal: ModalController;
    readonly flow: FlowController;
    readonly actions: ActionRunner;
    use<TRoot>(plugin: RendererPlugin<TRoot>, root: TRoot): void;
    dispose(): void;
}
export declare function createRuntime(options: RuntimeOptions): Runtime;
export type { BDUIElement };
//# sourceMappingURL=runtime.d.ts.map