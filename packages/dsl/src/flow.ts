import type { FlowRouteScreen, FlowStep, FlowTransition, RuntimeStateLike } from './types.js';

type GuardEvaluator = (
  flow: Record<string, unknown>,
  session: Record<string, unknown>,
  local: Record<string, unknown>,
) => unknown;

const guardCache = new Map<string, GuardEvaluator>();

function compileGuard(expr: string): GuardEvaluator {
  if (!guardCache.has(expr)) {
    const fn = new Function('flow', 'session', 'local', `return (${expr});`);
    guardCache.set(expr, fn as GuardEvaluator);
  }
  return guardCache.get(expr)!;
}

function evaluateGuard(transition: FlowTransition, state: RuntimeStateLike): boolean {
  if (!transition.guard) return true;
  try {
    const evaluator = compileGuard(transition.guard);
    return !!evaluator(state.flow ?? {}, state.session ?? {}, state.local ?? {});
  } catch {
    return false;
  }
}

export type FlowResolution = {
  step: FlowStep;
  stepId: string;
};

export function resolveFlowStep(
  route: FlowRouteScreen,
  state: RuntimeStateLike = {},
  currentStepId?: string,
): FlowResolution {
  const steps = route.steps ?? [];
  if (steps.length === 0) {
    throw new Error(`Flow route "${route.id}" has no steps defined.`);
  }

  const stepMap = new Map<string, FlowStep>(steps.map((step) => [step.id, step]));
  const startId = currentStepId ?? route.startStep;

  let current = stepMap.get(startId);
  if (!current) {
    throw new Error(`Step not found: ${startId}`);
  }

  const transitions = current.transitions ?? [];
  for (const transition of transitions) {
    if (evaluateGuard(transition, state)) {
      const next = stepMap.get(transition.to);
      if (next) {
        current = next;
      }
      break;
    }
  }

  return { step: current, stepId: current.id };
}

export function clearGuardCache() {
  guardCache.clear();
}
