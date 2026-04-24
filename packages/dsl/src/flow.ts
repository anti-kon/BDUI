import type { FlowRouteScreen, FlowStep, FlowTransition, RuntimeStateLike } from '@bdui/core';
import { decodeExpr } from '@bdui/core';
import { evalExpression } from '@bdui/expr';

export function evaluateGuard(transition: FlowTransition, state: RuntimeStateLike): boolean {
  if (!transition.guard) return true;
  try {
    const code = transition.guard.code;
    const result = evalExpression(code, state);
    return Boolean(result);
  } catch {
    return false;
  }
}

/**
 * Resolve the next flow step given current state and the starting step id.
 * If any transition guard evaluates to truthy, the first matching target
 * becomes the next step; otherwise the starting step is returned unchanged.
 */
export interface FlowResolution {
  readonly step: FlowStep;
  readonly stepId: string;
}

export function resolveFlowStep(
  route: FlowRouteScreen,
  state: RuntimeStateLike = {},
  currentStepId?: string,
): FlowResolution {
  const steps = route.steps ?? [];
  if (steps.length === 0) {
    throw new Error(`Flow route "${route.id}" has no steps defined.`);
  }

  const stepMap = new Map(steps.map((s) => [s.id, s] as const));
  const startId = currentStepId ?? route.startStep;
  let current = stepMap.get(startId);
  if (!current) throw new Error(`Step not found: "${startId}"`);

  for (const transition of current.transitions ?? []) {
    if (evaluateGuard(transition, state)) {
      const next = stepMap.get(transition.to);
      if (next) current = next;
      break;
    }
  }

  return { step: current, stepId: current.id };
}

/** Helper used by builders to produce a guard from a source string or ExprRef. */
export function asGuardExpr(value: string | { code: string } | undefined) {
  if (value == null) return undefined;
  if (typeof value === 'string') {
    const decoded = decodeExpr(value);
    return { __bduiExpr: true as const, code: decoded ?? value };
  }
  return { __bduiExpr: true as const, code: value.code };
}
