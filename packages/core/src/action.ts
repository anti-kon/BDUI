import type { Expression, ExprRef } from './expr.js';
import type { StateTarget } from './state.js';

/**
 * Server Action Language (SAL).
 *
 * A strongly-typed discriminated union describing every side effect the
 * renderer can execute in response to an event. No arbitrary code — every
 * branch has an explicit, serialisable payload.
 */
export type Action =
  | NavigateAction
  | BackAction
  | PopToRootAction
  | ReplaceAction
  | SetAction
  | ResetAction
  | UpdateIncAction
  | UpdateDecAction
  | UpdateToggleAction
  | UpdateAppendAction
  | UpdateMergeAction
  | UpdateMapPathAction
  | SyncAction
  | ValidateAction
  | FetchAction
  | CallAction
  | ToastAction
  | ModalOpenAction
  | ModalCloseAction
  | PrefetchScreensAction
  | BatchAction
  | WhenAction
  | FlowStartAction
  | FlowAdvanceAction
  | FlowGoToAction
  | FlowResumeAction
  | FlowAbortAction
  | FlowCompleteAction;

export type ActionType = Action['type'];

export type NavigateMode = 'push' | 'replace' | 'popToRoot';

export interface NavigateAction {
  readonly type: 'navigate';
  readonly params: {
    readonly to: string;
    readonly mode?: NavigateMode;
    readonly params?: Readonly<Record<string, unknown>>;
  };
}

export interface BackAction {
  readonly type: 'back';
}

export interface PopToRootAction {
  readonly type: 'popToRoot';
}

export interface ReplaceAction {
  readonly type: 'replace';
  readonly params: { readonly to: string };
}

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
  readonly params: { readonly target: StateTarget };
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

export interface FetchAction {
  readonly type: 'fetch';
  readonly params: {
    readonly sourceId: string;
    readonly params?: Readonly<Record<string, unknown>>;
    readonly saveTo?: StateTarget;
  };
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface CallAction {
  readonly type: 'call';
  readonly params: {
    readonly url: Expression<string>;
    readonly method: HttpMethod;
    readonly headers?: Readonly<Record<string, string>>;
    readonly body?: unknown;
    readonly saveTo?: StateTarget;
    readonly timeoutMs?: number;
  };
  readonly rollbackAction?: Action;
}

export type ToastLevel = 'info' | 'success' | 'warning' | 'error';

export interface ToastAction {
  readonly type: 'toast';
  readonly params: {
    readonly message: Expression<string>;
    readonly level?: ToastLevel;
    readonly durationMs?: number;
  };
}

export interface ModalOpenAction {
  readonly type: 'modal.open';
  readonly params: { readonly id: string };
}

export interface ModalCloseAction {
  readonly type: 'modal.close';
  readonly params: { readonly id: string };
}

export interface PrefetchScreensAction {
  readonly type: 'prefetchScreens';
  readonly params: { readonly screens: readonly string[] };
}

/** Run a list of actions sequentially, rolling back state if any fails. */
export interface BatchAction {
  readonly type: 'batch';
  readonly params: {
    readonly actions: readonly Action[];
    readonly atomic?: boolean;
  };
}

/** Conditionally execute one of the two action branches. */
export interface WhenAction {
  readonly type: 'when';
  readonly params: {
    readonly if: ExprRef;
    readonly then: readonly Action[];
    readonly else?: readonly Action[];
  };
}

export interface FlowStartAction {
  readonly type: 'flow.start';
  readonly params: {
    readonly routeId: string;
    readonly params?: Readonly<Record<string, unknown>>;
  };
}

export interface FlowAdvanceAction {
  readonly type: 'flow.advance';
  readonly params?: {
    readonly routeId?: string;
  };
}

export interface FlowGoToAction {
  readonly type: 'flow.goTo';
  readonly params: {
    readonly routeId?: string;
    readonly stepId: string;
  };
}

export interface FlowResumeAction {
  readonly type: 'flow.resume';
  readonly params?: {
    readonly routeId?: string;
  };
}

export interface FlowAbortAction {
  readonly type: 'flow.abort';
  readonly params?: {
    readonly routeId?: string;
    readonly reason?: string;
  };
}

export interface FlowCompleteAction {
  readonly type: 'flow.complete';
  readonly params?: {
    readonly routeId?: string;
  };
}

const FLOW_ACTION_TYPES = new Set<string>([
  'flow.start',
  'flow.advance',
  'flow.goTo',
  'flow.resume',
  'flow.abort',
  'flow.complete',
]);

export function isFlowAction(
  action: Action,
): action is
  | FlowStartAction
  | FlowAdvanceAction
  | FlowGoToAction
  | FlowResumeAction
  | FlowAbortAction
  | FlowCompleteAction {
  return FLOW_ACTION_TYPES.has(action.type);
}

export function isUpdateAction(
  action: Action,
): action is
  | SetAction
  | ResetAction
  | UpdateIncAction
  | UpdateDecAction
  | UpdateToggleAction
  | UpdateAppendAction
  | UpdateMergeAction
  | UpdateMapPathAction {
  return action.type === 'set' || action.type === 'reset' || action.type.startsWith('update.');
}
