/**
 * State mutation actions: set/reset plus the `update.*` family that operates on
 * a {@link StateTarget}.
 */
import type { Action } from '../action.js';
import type { Expression, ExprRef } from '../expr.js';
import type { StateTarget } from '../state.js';
export interface SetAction {
    readonly type: 'set';
    readonly params: {
        readonly target: StateTarget;
        readonly value: unknown;
    };
}
export interface ResetAction {
    readonly type: 'reset';
    readonly params: {
        readonly target: StateTarget;
        readonly value?: unknown;
    };
}
export interface UpdateIncAction {
    readonly type: 'update.inc';
    readonly params: {
        readonly target: StateTarget;
        readonly by?: Expression<number>;
    };
}
export interface UpdateDecAction {
    readonly type: 'update.dec';
    readonly params: {
        readonly target: StateTarget;
        readonly by?: Expression<number>;
    };
}
export interface UpdateToggleAction {
    readonly type: 'update.toggle';
    readonly params: {
        readonly target: StateTarget;
    };
}
export interface UpdateAppendAction {
    readonly type: 'update.append';
    readonly params: {
        readonly target: StateTarget;
        readonly value: unknown;
    };
}
export interface UpdateMergeAction {
    readonly type: 'update.merge';
    readonly params: {
        readonly target: StateTarget;
        readonly value: Readonly<Record<string, unknown>> | ExprRef;
    };
}
/** Apply a typed map (pick/rename/default) on an object path. */
export interface UpdateMapPathAction {
    readonly type: 'update.mapPath';
    readonly params: {
        readonly target: StateTarget;
        readonly pick?: readonly string[];
        readonly rename?: Readonly<Record<string, string>>;
        readonly defaults?: Readonly<Record<string, unknown>>;
    };
}
export interface SyncAction {
    readonly type: 'sync';
    readonly params?: Readonly<Record<string, unknown>>;
}
export interface ValidateAction {
    readonly type: 'validate';
    readonly params: {
        readonly schemaRef: string;
        readonly target: StateTarget;
    };
}
export declare function isUpdateAction(action: Action): action is SetAction | ResetAction | UpdateIncAction | UpdateDecAction | UpdateToggleAction | UpdateAppendAction | UpdateMergeAction | UpdateMapPathAction;
//# sourceMappingURL=state.d.ts.map