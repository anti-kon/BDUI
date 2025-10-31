import type { Action, Scope } from '@bdui/common';

import type { NavigationController } from './navigation.js';
import type { RuntimeStateController } from './state.js';

type ActionRunnerDeps = {
  state: RuntimeStateController;
  navigation: NavigationController;
  rerender: () => void;
  onRouteChange?: (routeId: string) => void;
  showToast?: (message: string) => void;
};

type RunResult = {
  stateDirty?: boolean;
  routeDirty?: boolean;
};

const reducerCache = new Map<string, Function>();

type ActionOfType<TType extends Action['type']> = Extract<Action, { type: TType }>;

function getReducer(code: string): Function {
  const cached = reducerCache.get(code);
  if (cached) return cached;

  try {
    const factory = new Function(`return (${code});`);
    const fn = factory();
    if (typeof fn !== 'function') {
      throw new Error('Reducer code did not evaluate to a function');
    }
    reducerCache.set(code, fn);
    return fn;
  } catch (error) {
    console.warn('[bdui/renderer-web] Failed to compile reducer:', error);
    const identity = (value: unknown) => value;
    reducerCache.set(code, identity);
    return identity;
  }
}

function runSetAction(state: RuntimeStateController, action: ActionOfType<'set'>): RunResult {
  const target = action.params?.target;
  if (!target) return {};
  if (typeof target.scope !== 'string' || typeof target.path !== 'string') return {};
  state.set(target.scope as Scope, target.path, action.params?.value);
  return { stateDirty: true };
}

function runUpdateAction(state: RuntimeStateController, action: ActionOfType<'update'>): RunResult {
  const target = action.params?.target;
  const reducerCode = action.params?.reducer;
  if (!target || typeof reducerCode !== 'string') return {};
  if (typeof target.scope !== 'string' || typeof target.path !== 'string') return {};
  const prev = state.get(target.scope as Scope, target.path);
  const reducer = getReducer(reducerCode);
  const next = reducer(prev);
  state.set(target.scope as Scope, target.path, next);
  return { stateDirty: true };
}

function runNavigateAction(
  navigation: NavigationController,
  action: ActionOfType<'navigate'>,
): RunResult {
  const to = action.params?.to;
  if (!to) return {};
  const mode = action.params?.mode ?? 'push';
  if (mode === 'popToRoot') {
    const changed = navigation.popToRoot();
    const navigated = navigation.navigate(to, 'replace');
    return { routeDirty: changed || navigated };
  }
  return { routeDirty: navigation.navigate(to, mode) };
}

export function createActionRunner(deps: ActionRunnerDeps) {
  const { state, navigation, rerender, onRouteChange, showToast } = deps;

  function applyResult(result: RunResult) {
    const { stateDirty, routeDirty } = result;
    if (routeDirty) {
      onRouteChange?.(navigation.currentRoute);
    }
    if (stateDirty || routeDirty) {
      rerender();
    }
  }

  function runAction(action: Action | undefined | null): RunResult {
    if (!action) return {};
    switch (action.type) {
      case 'set':
        return runSetAction(state, action as ActionOfType<'set'>);
      case 'update':
        return runUpdateAction(state, action as ActionOfType<'update'>);
      case 'navigate':
        return runNavigateAction(navigation, action as ActionOfType<'navigate'>);
      case 'back':
        return { routeDirty: navigation.back() };
      case 'replace':
        const replaceAction = action as ActionOfType<'replace'>;
        if (typeof replaceAction.params?.to !== 'string') return {};
        return { routeDirty: navigation.replace(replaceAction.params.to) };
      case 'popToRoot':
        return { routeDirty: navigation.popToRoot() };
      case 'toast': {
        const message = action.params?.message ?? '';
        if (showToast) showToast(message);
        else alert(message);
        return {};
      }
      default:
        console.warn('[bdui/renderer-web] Unsupported action:', action.type, action);
        return {};
    }
  }

  function runActions(actions?: Action[]) {
    if (!actions || actions.length === 0) return;
    let stateDirty = false;
    let routeDirty = false;

    for (const action of actions) {
      const result = runAction(action);
      stateDirty = stateDirty || !!result.stateDirty;
      routeDirty = routeDirty || !!result.routeDirty;
    }

    applyResult({ stateDirty, routeDirty });
  }

  return {
    runActions,
  };
}
