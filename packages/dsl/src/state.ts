import type { Binding, InitialState, Scope } from '@bdui/core';

import { E, type Expr } from './expr.js';

/**
 * A typed state variable handle. Produced by `Flow()`, `Session()`, `Local()`.
 * Carries scope/path metadata, an optional initial value, and a brand used by
 * DSL builders (`bind(...)`, `use(...)`, action shorthands).
 */
export interface StateVar<T = unknown> extends Binding {
  readonly __var: true;
  readonly name: string;
  /** Only present for scopes that support initial values (flow/session). */
  readonly initialValue?: T;
}

export interface FlowVar<T = unknown> extends StateVar<T> {
  readonly scope: 'flow';
}
export interface SessionVar<T = unknown> extends StateVar<T> {
  readonly scope: 'session';
}
export interface LocalVar<T = unknown> extends StateVar<T> {
  readonly scope: 'local';
}

export interface DeclaredInitialState extends InitialState {
  readonly flow: Record<string, unknown>;
  readonly session: Record<string, unknown>;
}

/**
 * Collector of initial state. Each call to `Flow("x", default)` or
 * `Session("y", default)` with a non-undefined default registers the value
 * with the currently active collector (if any). This avoids the previous
 * module-level mutable state.
 */
export interface StateCollector {
  declare(scope: Scope, name: string, value: unknown): void;
  snapshot(): DeclaredInitialState;
}

let activeCollector: StateCollector | null = null;

const moduleDefaults: { flow: Record<string, unknown>; session: Record<string, unknown> } = {
  flow: {},
  session: {},
};

export function createStateCollector(): StateCollector {
  const flow: Record<string, unknown> = {};
  const session: Record<string, unknown> = {};

  return {
    declare(scope, name, value) {
      if (value === undefined) return;
      if (scope === 'flow') flow[name] = clone(value);
      else if (scope === 'session') session[name] = clone(value);
      // 'local' scope has no declared defaults.
    },
    snapshot() {
      return {
        flow: { ...clone(moduleDefaults.flow), ...clone(flow) },
        session: { ...clone(moduleDefaults.session), ...clone(session) },
      };
    },
  };
}

export function withStateCollector<T>(collector: StateCollector, fn: () => T): T {
  const prev = activeCollector;
  activeCollector = collector;
  try {
    return fn();
  } finally {
    activeCollector = prev;
  }
}

/**
 * Clears module-level default accumulator. Exposed for tests and tools that
 * build several independent contracts in the same process.
 */
export function resetModuleDefaults(): void {
  moduleDefaults.flow = {};
  moduleDefaults.session = {};
}

function declareVar(scope: Scope, name: string, initialValue: unknown): void {
  if (activeCollector) {
    activeCollector.declare(scope, name, initialValue);
  }
  if (scope === 'flow' || scope === 'session') {
    moduleDefaults[scope][name] = clone(initialValue);
  }
}

function clone<T>(value: T): T {
  const sc = (globalThis as { structuredClone?: <U>(u: U) => U }).structuredClone;
  if (typeof sc === 'function') return sc(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

function makeVar<T, S extends Scope>(
  scope: S,
  name: string,
  initialValue?: T,
): StateVar<T> & {
  readonly scope: S;
} {
  if (!name || typeof name !== 'string') {
    throw new Error('State variable name must be a non-empty string');
  }
  if (initialValue !== undefined && (scope === 'flow' || scope === 'session')) {
    declareVar(scope, name, initialValue);
  }
  return { __var: true, scope, name, path: name, initialValue };
}

export function Flow<T>(name: string, initialValue?: T): FlowVar<T> {
  return makeVar<T, 'flow'>('flow', name, initialValue);
}

export function Session<T>(name: string, initialValue?: T): SessionVar<T> {
  return makeVar<T, 'session'>('session', name, initialValue);
}

export function Local<T>(name: string): LocalVar<T> {
  return makeVar<T, 'local'>('local', name);
}

/** Produce an expression referencing the state var. */
export function use<T>(v: StateVar<T>): Expr<T> {
  return E<T>(`${v.scope}.${v.path}`);
}

/** Produce a two-way binding descriptor. */
export function bind<T>(v: StateVar<T>): Binding {
  return { scope: v.scope, path: v.path };
}

export function isStateVar(value: unknown): value is StateVar {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { __var?: unknown }).__var === true &&
    typeof (value as { scope?: unknown }).scope === 'string' &&
    typeof (value as { path?: unknown }).path === 'string'
  );
}
