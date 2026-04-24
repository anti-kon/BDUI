import type { Binding, InitialState, Scope } from '@bdui/core';
import { type Expr } from './expr.js';
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
export declare function createStateCollector(): StateCollector;
export declare function withStateCollector<T>(collector: StateCollector, fn: () => T): T;
/**
 * Clears module-level default accumulator. Exposed for tests and tools that
 * build several independent contracts in the same process.
 */
export declare function resetModuleDefaults(): void;
export declare function Flow<T>(name: string, initialValue?: T): FlowVar<T>;
export declare function Session<T>(name: string, initialValue?: T): SessionVar<T>;
export declare function Local<T>(name: string): LocalVar<T>;
/** Produce an expression referencing the state var. */
export declare function use<T>(v: StateVar<T>): Expr<T>;
/** Produce a two-way binding descriptor. */
export declare function bind<T>(v: StateVar<T>): Binding;
export declare function isStateVar(value: unknown): value is StateVar;
//# sourceMappingURL=state.d.ts.map