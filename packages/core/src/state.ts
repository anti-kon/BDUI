/**
 * Runtime state scopes. Defines three-level state model used across the stack.
 *
 * - `local` — current screen/step only, never persisted.
 * - `session` — user session, persisted in client-side storage (LocalStorage on web).
 * - `flow` — shared across steps of a single flow.
 */
export type Scope = 'local' | 'session' | 'flow';

export const SCOPES: readonly Scope[] = ['local', 'session', 'flow'];

export function isScope(value: unknown): value is Scope {
  return typeof value === 'string' && (SCOPES as readonly string[]).includes(value);
}

/** Address of a value inside runtime state. */
export interface StateTarget {
  readonly scope: Scope;
  readonly path: string;
}

/** A contract-level reference to a state value (used for two-way binding). */
export interface Binding {
  readonly scope: Scope;
  readonly path: string;
}

/** Snapshot shape used by evaluators. */
export interface RuntimeStateLike {
  readonly flow?: Readonly<Record<string, unknown>>;
  readonly session?: Readonly<Record<string, unknown>>;
  readonly local?: Readonly<Record<string, unknown>>;
  readonly params?: Readonly<Record<string, unknown>>;
}

/** Initial state shipped with a contract. */
export interface InitialState {
  readonly flow?: Record<string, unknown>;
  readonly session?: Record<string, unknown>;
}
