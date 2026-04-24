import type { FlowRouteScreen, FlowStateHandle, FlowStep, RuntimeStateLike } from '@bdui/core';
import { evalExpression } from '@bdui/expr';

import type { RuntimeStateController } from './state.js';

export interface FlowStepResolution {
  readonly step: FlowStep;
  readonly stepId: string;
  readonly matchedTransition?: { readonly to: string };
  readonly createdStep: boolean;
}

function stepById(route: FlowRouteScreen, id: string): FlowStep | undefined {
  return route.steps.find((s) => s.id === id);
}

function evaluateGuard(expr: string | undefined, state: RuntimeStateLike): boolean {
  if (!expr) return true;
  try {
    return !!evalExpression(expr, state);
  } catch {
    return false;
  }
}

/**
 * Resolve the active step of a flow: evaluates transitions' guards on the
 * current step and advances as far as possible.
 */
export function resolveFlowStep(
  route: FlowRouteScreen,
  state: RuntimeStateLike,
  currentStepId?: string,
): FlowStepResolution {
  let stepId = currentStepId ?? route.startStep;
  let step = stepById(route, stepId);
  let createdStep = false;
  if (!step) {
    step = stepById(route, route.startStep);
    stepId = route.startStep;
    createdStep = true;
    if (!step) {
      throw new Error(`Flow ${route.id}: unable to resolve start step ${route.startStep}`);
    }
  }

  let guardedTransition: { readonly to: string } | undefined;
  let attempts = 0;
  const MAX_ATTEMPTS = 64;
  while (attempts++ < MAX_ATTEMPTS) {
    const next = (step.transitions ?? []).find((t) => {
      const guard = typeof t.guard === 'string' ? t.guard : undefined;
      return evaluateGuard(guard, state);
    });
    if (!next) break;
    const nextStep = stepById(route, next.to);
    if (!nextStep) break;
    guardedTransition = { to: next.to };
    step = nextStep;
    stepId = next.to;
    createdStep = true;
  }

  if (attempts >= MAX_ATTEMPTS) {
    throw new Error(
      `Flow ${route.id}: exceeded max transition depth (${MAX_ATTEMPTS}). Possible guard loop.`,
    );
  }

  return guardedTransition
    ? { step, stepId, matchedTransition: guardedTransition, createdStep }
    : { step, stepId, createdStep };
}

export interface FlowController {
  /**
   * Record/update a flow handle and return its identifier. Used for actions
   * like flow.start/resume to remember which flow is active.
   */
  activate(routeId: string, handle?: Partial<FlowStateHandle>): void;
  deactivate(routeId: string): void;
  getActive(routeId: string): Partial<FlowStateHandle> | undefined;
}

export function createFlowController(state: RuntimeStateController): FlowController {
  const ACTIVE_KEY = '__flowActive';
  return {
    activate(routeId, handle) {
      const current = (state.read('flow', ACTIVE_KEY) as Record<string, unknown> | undefined) ?? {};
      const next = { ...current, [routeId]: { ...(handle ?? {}), at: Date.now() } };
      state.write('flow', ACTIVE_KEY, next);
    },
    deactivate(routeId) {
      const current = (state.read('flow', ACTIVE_KEY) as Record<string, unknown> | undefined) ?? {};
      if (!(routeId in current)) return;
      const next = { ...current };
      delete next[routeId];
      state.write('flow', ACTIVE_KEY, next);
    },
    getActive(routeId) {
      const current = (state.read('flow', ACTIVE_KEY) as Record<string, unknown> | undefined) ?? {};
      return current[routeId] as Partial<FlowStateHandle> | undefined;
    },
  };
}
