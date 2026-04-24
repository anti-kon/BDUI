import type { Action, Contract, ValidateAction } from '@bdui/core';
import { type Unsubscribe } from './events.js';
import type { FlowController } from './flow.js';
import type { HttpClient } from './http.js';
import type { ModalController } from './modal.js';
import type { NavigationController } from './navigation.js';
import type { RuntimeStateController } from './state.js';
import type { ToastController } from './toast.js';
export interface ActionRunnerEventMap {
    error: {
        readonly action: Action;
        readonly error: unknown;
    };
    executed: {
        readonly action: Action;
    };
    stateDirty: Record<string, never>;
    routeDirty: Record<string, never>;
}
export interface ActionRunner {
    run(action: Action): Promise<void>;
    runAll(actions: readonly Action[] | undefined): Promise<void>;
    on<K extends keyof ActionRunnerEventMap>(event: K, listener: (payload: ActionRunnerEventMap[K]) => void): Unsubscribe;
}
export interface StateValidationContext {
    readonly schemaRef: string;
    readonly target: ValidateAction['params']['target'];
    readonly state: ReturnType<RuntimeStateController['snapshot']>;
}
export type StateValidationResult = boolean | string | readonly string[] | {
    readonly ok: boolean;
    readonly errors?: readonly string[];
};
export type StateValidator = (value: unknown, context: StateValidationContext) => StateValidationResult | Promise<StateValidationResult>;
export interface ActionRunnerDeps {
    readonly contract?: Contract;
    readonly state: RuntimeStateController;
    readonly navigation: NavigationController;
    readonly flow: FlowController;
    readonly toast: ToastController;
    readonly modal: ModalController;
    readonly http?: HttpClient;
    readonly validators?: Readonly<Record<string, StateValidator>>;
    readonly prefetchScreens?: (screens: readonly string[]) => Promise<void> | void;
}
export declare function createActionRunner(deps: ActionRunnerDeps): ActionRunner;
//# sourceMappingURL=actions.d.ts.map