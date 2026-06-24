import type {
  FlowAbortAction,
  FlowAdvanceAction,
  FlowCompleteAction,
  FlowGoToAction,
  FlowResumeAction,
  FlowStartAction,
} from '@bdui/core';

import type { ActionContext } from './context.js';

export function handleFlowStart(ctx: ActionContext, action: FlowStartAction): void {
  ctx.flow.activate(action.params.routeId);
  if (action.params.params) ctx.state.setParams(action.params.params);
  ctx.navigation.navigate(action.params.routeId, 'push');
  ctx.bus.emit('routeDirty', {});
}

export function handleFlowAdvance(ctx: ActionContext, action: FlowAdvanceAction): void {
  /* Handled by the renderer in concert with flow resolution. Emitting dirty
   * signals is enough — the platform will re-render and evaluate next step. */
  void action;
  ctx.bus.emit('routeDirty', {});
}

export function handleFlowGoTo(ctx: ActionContext, action: FlowGoToAction): void {
  const routeId = action.params.routeId ?? ctx.navigation.currentRoute;
  ctx.state.write('local', `__flow.${routeId}.current`, action.params.stepId);
  ctx.bus.emit('stateDirty', {});
}

export function handleFlowResume(ctx: ActionContext, action: FlowResumeAction): void {
  void action;
  ctx.bus.emit('routeDirty', {});
}

export function handleFlowAbort(ctx: ActionContext, action: FlowAbortAction): void {
  const routeId = action.params?.routeId ?? ctx.navigation.currentRoute;
  ctx.flow.deactivate(routeId);
  ctx.bus.emit('routeDirty', {});
}

export function handleFlowComplete(ctx: ActionContext, action: FlowCompleteAction): void {
  const routeId = action.params?.routeId ?? ctx.navigation.currentRoute;
  ctx.flow.deactivate(routeId);
  ctx.bus.emit('routeDirty', {});
}
