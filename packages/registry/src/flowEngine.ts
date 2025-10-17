type State = {
  flow?: Record<string, any>;
  session?: Record<string, any>;
  local?: Record<string, any>;
};

function safeEval(expr: string, ctx: State): any {
  // Very simple evaluator; in prod replace with a real sandbox/interpreter
  // Allows referencing flow/session/local
  const fn = new Function('flow', 'session', 'local', `return (${expr});`);
  return fn(ctx.flow ?? {}, ctx.session ?? {}, ctx.local ?? {});
}

export function resolveRouteNode(
  contract: any,
  routeId: string,
  state: State = {},
  currentStepId?: string,
) {
  const route = (contract?.navigation?.routes || []).find((r: any) => r.id === routeId);
  if (!route) throw new Error(`Route not found: ${routeId}`);

  if (route.type !== 'flow') {
    return { type: 'screen', node: route.node };
  }

  // flow route
  const steps = route.steps || [];
  const idToStep = new Map(steps.map((s: any) => [s.id, s]));
  const start = route.startStep;
  let stepId = currentStepId || start;

  let step = idToStep.get(stepId);
  if (!step) throw new Error(`Step not found: ${stepId}`);

  // compute next transition if any guard is true (server-side evaluation)
  const transitions = step.transitions || [];
  for (const t of transitions) {
    if (!t.guard) {
      stepId = t.to;
      break;
    }
    try {
      const ok = !!safeEval(t.guard, state);
      if (ok) {
        stepId = t.to;
        break;
      }
    } catch {
      // ignore bad guard
    }
  }

  step = idToStep.get(stepId) || step;

  return { type: 'flow', stepId, step };
}
