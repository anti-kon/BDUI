import type { Contract, RuntimeStateLike, Scope, StateTarget } from '@bdui/core';

import { EventBus, type Unsubscribe } from './events.js';
import { deepGet, deepSet } from './path.js';
import type { StorageAdapter } from './storage.js';
import { MemoryStorageAdapter } from './storage.js';

export interface RuntimeStateSnapshot extends RuntimeStateLike {
  readonly flow: Readonly<Record<string, unknown>>;
  readonly session: Readonly<Record<string, unknown>>;
  readonly local: Readonly<Record<string, unknown>>;
  readonly params: Readonly<Record<string, unknown>>;
}

export interface RuntimeStateEventMap {
  change: {
    readonly scope: Scope;
    readonly path: string;
    readonly value: unknown;
  };
}

export interface RuntimeStateController {
  readonly snapshot: () => RuntimeStateSnapshot;
  get(target: StateTarget | { scope: Scope; path: string }): unknown;
  read(scope: Scope, path: string): unknown;
  set(target: StateTarget, value: unknown): void;
  write(scope: Scope, path: string, value: unknown): void;
  replace(scope: Scope, next: Readonly<Record<string, unknown>>): void;
  on<K extends keyof RuntimeStateEventMap>(
    event: K,
    listener: (payload: RuntimeStateEventMap[K]) => void,
  ): Unsubscribe;
  persistSession(): void;
  params: Readonly<Record<string, unknown>>;
  setParams(next: Readonly<Record<string, unknown>>): void;
}

export interface CreateStateOptions {
  readonly contract: Contract;
  readonly storage?: StorageAdapter;
  readonly sessionKey?: string;
}

function cloneRecord(
  record: Readonly<Record<string, unknown>> | undefined,
): Record<string, unknown> {
  if (!record) return {};
  return JSON.parse(JSON.stringify(record)) as Record<string, unknown>;
}

export function createRuntimeStateController(options: CreateStateOptions): RuntimeStateController {
  const storage = options.storage ?? new MemoryStorageAdapter();
  const sessionKey =
    options.sessionKey ||
    `bdui_session_${options.contract.meta.appId || options.contract.meta.contractId}`;

  const initialFlow = cloneRecord(options.contract.initial?.flow);
  const initialSession = cloneRecord(options.contract.initial?.session);

  let sessionState: Record<string, unknown> = (() => {
    const raw = storage.getItem(sessionKey);
    if (!raw) return initialSession;
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return initialSession;
    }
  })();

  let flowState: Record<string, unknown> = initialFlow;
  let localState: Record<string, unknown> = {};
  let paramsState: Record<string, unknown> = {};

  const bus = new EventBus<RuntimeStateEventMap>();

  function persistSession(): void {
    try {
      storage.setItem(sessionKey, JSON.stringify(sessionState));
    } catch {
      /* ignore */
    }
  }

  function read(scope: Scope, path: string): unknown {
    switch (scope) {
      case 'flow':
        return deepGet(flowState, path);
      case 'session':
        return deepGet(sessionState, path);
      case 'local':
        return deepGet(localState, path);
    }
  }

  function write(scope: Scope, path: string, value: unknown): void {
    switch (scope) {
      case 'flow':
        flowState = deepSet(flowState, path, value);
        break;
      case 'session':
        sessionState = deepSet(sessionState, path, value);
        persistSession();
        break;
      case 'local':
        localState = deepSet(localState, path, value);
        break;
    }
    bus.emit('change', { scope, path, value });
  }

  function snapshot(): RuntimeStateSnapshot {
    return {
      flow: flowState,
      session: sessionState,
      local: localState,
      params: paramsState,
    };
  }

  return {
    snapshot,
    get({ scope, path }) {
      return read(scope, path);
    },
    read,
    set(target, value) {
      write(target.scope, target.path, value);
    },
    write,
    replace(scope, next) {
      const cloned = { ...next };
      switch (scope) {
        case 'flow':
          flowState = cloned;
          break;
        case 'session':
          sessionState = cloned;
          persistSession();
          break;
        case 'local':
          localState = cloned;
          break;
      }
      bus.emit('change', { scope, path: '', value: cloned });
    },
    on(event, listener) {
      return bus.on(event, listener);
    },
    persistSession,
    get params() {
      return paramsState;
    },
    setParams(next) {
      paramsState = { ...next };
    },
  };
}
