const guardCache = new Map();
function compileGuard(expr) {
  if (!guardCache.has(expr)) {
    const fn = new Function('flow', 'session', 'local', `return (${expr});`);
    guardCache.set(expr, fn);
  }
  return guardCache.get(expr);
}
function evaluateGuard(transition, state) {
  if (!transition.guard) return true;
  try {
    const evaluator = compileGuard(transition.guard);
    return !!evaluator(state.flow ?? {}, state.session ?? {}, state.local ?? {});
  } catch {
    return false;
  }
}
export function resolveFlowStep(route, state = {}, currentStepId) {
  const steps = route.steps ?? [];
  if (steps.length === 0) {
    throw new Error(`Flow route "${route.id}" has no steps defined.`);
  }
  const stepMap = new Map(steps.map((step) => [step.id, step]));
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
