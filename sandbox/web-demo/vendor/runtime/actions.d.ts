import type { Action } from '@bdui/core';
import { type ActionRunnerDeps, type ActionRunnerEventMap } from './action-handlers/context.js';
import { type Unsubscribe } from './events.js';
export type { ActionRunnerDeps, ActionRunnerEventMap, StateValidationContext, StateValidationResult, StateValidator, } from './action-handlers/context.js';
export interface ActionRunner {
    run(action: Action): Promise<void>;
    runAll(actions: readonly Action[] | undefined): Promise<void>;
    on<K extends keyof ActionRunnerEventMap>(event: K, listener: (payload: ActionRunnerEventMap[K]) => void): Unsubscribe;
}
export declare function createActionRunner(deps: ActionRunnerDeps): ActionRunner;
//# sourceMappingURL=actions.d.ts.map