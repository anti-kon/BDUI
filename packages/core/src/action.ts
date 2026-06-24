/**
 * Server Action Language (SAL).
 *
 * A strongly-typed discriminated union describing every side effect the
 * renderer can execute in response to an event. No arbitrary code — every
 * branch has an explicit, serialisable payload.
 *
 * The concrete action shapes are grouped by domain under `./actions/*` and
 * re-exported here so that `@bdui/core` keeps a single, flat action surface.
 */
import type { BatchAction, WhenAction } from './actions/control.js';
import type { CallAction, FetchAction } from './actions/data.js';
import type {
  ModalCloseAction,
  ModalOpenAction,
  PrefetchScreensAction,
  ToastAction,
} from './actions/feedback.js';
import type {
  FlowAbortAction,
  FlowAdvanceAction,
  FlowCompleteAction,
  FlowGoToAction,
  FlowResumeAction,
  FlowStartAction,
} from './actions/flow.js';
import type {
  BackAction,
  NavigateAction,
  PopToRootAction,
  ReplaceAction,
} from './actions/navigation.js';
import type {
  ResetAction,
  SetAction,
  SyncAction,
  UpdateAppendAction,
  UpdateDecAction,
  UpdateIncAction,
  UpdateMapPathAction,
  UpdateMergeAction,
  UpdateToggleAction,
  ValidateAction,
} from './actions/state.js';

export * from './actions/control.js';
export * from './actions/data.js';
export * from './actions/feedback.js';
export * from './actions/flow.js';
export * from './actions/navigation.js';
export * from './actions/state.js';

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
