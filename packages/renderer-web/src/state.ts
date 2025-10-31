import type { Contract as ContractDocument, RuntimeStateLike, Scope } from '@bdui/common';

export type RuntimeState = {
  flow: Record<string, any>;
  session: Record<string, any>;
  local: Record<string, any>;
};

export type RuntimeStateController = {
  readonly state: RuntimeState;
  get(scope: Scope, path: string): unknown;
  set(scope: Scope, path: string, value: unknown): void;
  evaluate<T = unknown>(expr: string): T;
  interpolate(template: string): string;
  persistSession(): void;
};

const hasLocalStorage = typeof window !== 'undefined' && 'localStorage' in window;

function cloneState<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value ?? {}));
}

export function deepGet(obj: any, path: string): unknown {
  if (!path) return obj;
  const parts = path.split('.').filter(Boolean);
  let current: any = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return current;
}

export function deepSet(obj: any, path: string, value: unknown): void {
  const parts = path.split('.').filter(Boolean);
  if (parts.length === 0) return;
  let current: any = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]!;
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  current[parts.at(-1)!] = value;
}

function evaluateExpression(expr: string, state: RuntimeStateLike): unknown {
  const fn = new Function('flow', 'session', 'local', `return (${expr});`);
  return fn(state.flow ?? {}, state.session ?? {}, state.local ?? {});
}

function interpolateTemplate(template: string, state: RuntimeStateLike): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, expr) => {
    try {
      const value = evaluateExpression(expr, state);
      return value == null ? '' : String(value);
    } catch {
      return '';
    }
  });
}

export function createRuntimeStateController(
  contract: ContractDocument,
  storageKey: string,
): RuntimeStateController {
  const initialFlow = contract?.initial?.flow ?? {};
  const initialSession = contract?.initial?.session ?? {};

  const sessionState: Record<string, any> = (() => {
    if (!hasLocalStorage) return cloneState(initialSession);
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return cloneState(initialSession);
      return JSON.parse(raw);
    } catch {
      return cloneState(initialSession);
    }
  })();

  const state: RuntimeState = {
    flow: cloneState(initialFlow),
    session: sessionState,
    local: {},
  };

  function persistSession() {
    if (!hasLocalStorage) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state.session));
    } catch {
      /* ignore storage errors */
    }
  }

  return {
    state,
    get(scope, path) {
      return deepGet(state[scope], path);
    },
    set(scope, path, value) {
      deepSet(state[scope], path, value);
      if (scope === 'session') {
        persistSession();
      }
    },
    evaluate<T = unknown>(expr: string): T {
      return evaluateExpression(expr, state) as T;
    },
    interpolate(template) {
      return interpolateTemplate(template, state);
    },
    persistSession,
  };
}
