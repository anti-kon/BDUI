import type { Action, BDUIElement, Contract } from '@bdui/core';

import { type ActionRunner, createActionRunner, type StateValidator } from './actions.js';
import { createFlowController, type FlowController } from './flow.js';
import type { HttpClient } from './http.js';
import { createModalController, type ModalController } from './modal.js';
import { createNavigationController, type NavigationController } from './navigation.js';
import type { RendererPlugin } from './plugin.js';
import { createRuntimeStateController, type RuntimeStateController } from './state.js';
import type { StorageAdapter } from './storage.js';
import { MemoryStorageAdapter } from './storage.js';
import { createToastController, type ToastController } from './toast.js';

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

export function createRuntime(options: RuntimeOptions): Runtime {
  const storage = options.storage ?? new MemoryStorageAdapter();
  const state = createRuntimeStateController({ contract: options.contract, storage });
  const navigation = createNavigationController(options.contract.navigation);
  const toast = createToastController();
  const modal = createModalController();
  const flow = createFlowController(state);
  const actions = createActionRunner({
    contract: options.contract,
    state,
    navigation,
    flow,
    toast,
    modal,
    http: options.http,
    validators: options.validators,
    prefetchScreens: options.prefetchScreens,
  });

  const plugins: Array<{ plugin: RendererPlugin<unknown>; dispose(): void }> = [];

  function runActions(raw?: readonly unknown[]): Promise<void> {
    return actions.runAll(raw as readonly Action[] | undefined);
  }

  return {
    contract: options.contract,
    state,
    navigation,
    toast,
    modal,
    flow,
    actions,
    use<TRoot>(plugin: RendererPlugin<TRoot>, root: TRoot) {
      plugin.mount(root, {
        state,
        navigation,
        toast,
        modal,
        runActions,
      });
      plugins.push({
        plugin: plugin as RendererPlugin<unknown>,
        dispose: () => plugin.unmount?.(),
      });
    },
    dispose() {
      for (const { dispose } of plugins) {
        try {
          dispose();
        } catch {
          /* ignore */
        }
      }
      plugins.length = 0;
    },
  };
}

export type { BDUIElement };
