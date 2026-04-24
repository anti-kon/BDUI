import type { Contract, RuntimeStateLike, Scope, StateTarget } from '@bdui/core';
import { type Unsubscribe } from './events.js';
import type { StorageAdapter } from './storage.js';
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
    get(target: StateTarget | {
        scope: Scope;
        path: string;
    }): unknown;
    read(scope: Scope, path: string): unknown;
    set(target: StateTarget, value: unknown): void;
    write(scope: Scope, path: string, value: unknown): void;
    replace(scope: Scope, next: Readonly<Record<string, unknown>>): void;
    on<K extends keyof RuntimeStateEventMap>(event: K, listener: (payload: RuntimeStateEventMap[K]) => void): Unsubscribe;
    persistSession(): void;
    params: Readonly<Record<string, unknown>>;
    setParams(next: Readonly<Record<string, unknown>>): void;
}
export interface CreateStateOptions {
    readonly contract: Contract;
    readonly storage?: StorageAdapter;
    readonly sessionKey?: string;
}
export declare function createRuntimeStateController(options: CreateStateOptions): RuntimeStateController;
//# sourceMappingURL=state.d.ts.map