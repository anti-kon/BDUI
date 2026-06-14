import type { Contract } from '@bdui/core';
import {
  createFetchHttpClient,
  createLocalStorageAdapter,
  createRuntime,
  type HttpClient,
  type Runtime,
  type StateValidator,
  type StorageAdapter,
} from '@bdui/runtime';

import { createWebPlugin } from './plugin.js';

export interface MountOptions {
  readonly urlSync?: boolean;
  readonly storage?: StorageAdapter;
  readonly http?: HttpClient;
  readonly validators?: Readonly<Record<string, StateValidator>>;
  readonly prefetchScreens?: (screens: readonly string[]) => Promise<void> | void;
}

export interface MountedApp {
  readonly runtime: Runtime;
  readonly dispose: () => void;
}

export function mount(
  container: HTMLElement,
  contract: Contract,
  options: MountOptions = {},
): MountedApp {
  const storage = options.storage ?? createLocalStorageAdapter();
  const runtime = createRuntime({
    contract,
    storage,
    http: options.http ?? createFetchHttpClient(),
    validators: options.validators,
    prefetchScreens: options.prefetchScreens,
  });
  const plugin = createWebPlugin({
    urlSync: options.urlSync ?? !!contract.navigation.urlSync,
    contract,
  });
  runtime.use(plugin, container);

  return {
    runtime,
    dispose() {
      runtime.dispose();
      while (container.firstChild) container.removeChild(container.firstChild);
    },
  };
}
