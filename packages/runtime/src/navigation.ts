import type { AppRoute, Navigation as NavigationConfig } from '@bdui/core';
import { isFlowRoute, isScreenRoute } from '@bdui/core';

import { EventBus, type Unsubscribe } from './events.js';

export interface NavigationEventMap {
  change: { readonly from: string | null; readonly to: string; readonly mode: 'push' | 'replace' };
  back: { readonly to: string };
}

export interface NavigationController {
  readonly currentRoute: string;
  readonly routes: readonly AppRoute[];
  resolve(routeId: string): AppRoute | undefined;
  navigate(to: string, mode?: 'push' | 'replace'): boolean;
  replace(to: string): boolean;
  back(): boolean;
  popToRoot(): boolean;
  sync(routeId?: string | null): boolean;
  on<K extends keyof NavigationEventMap>(
    event: K,
    listener: (payload: NavigationEventMap[K]) => void,
  ): Unsubscribe;
}

export function createNavigationController(navigation: NavigationConfig): NavigationController {
  const routeMap = new Map<string, AppRoute>(navigation.routes.map((r) => [r.id, r] as const));
  const history: string[] = [];
  const initial = navigation.initialRoute;
  let current = navigation.initialRoute;
  const bus = new EventBus<NavigationEventMap>();

  function transition(to: string, mode: 'push' | 'replace'): boolean {
    if (!routeMap.has(to)) return false;
    if (to === current && mode === 'replace') return false;
    const from = current;
    if (mode === 'push' && from) history.push(from);
    current = to;
    bus.emit('change', { from: from ?? null, to, mode });
    return true;
  }

  return {
    get currentRoute() {
      return current;
    },
    routes: navigation.routes,
    resolve: (id) => routeMap.get(id),
    navigate(to, mode = 'push') {
      return transition(to, mode);
    },
    replace(to) {
      return transition(to, 'replace');
    },
    back() {
      const prev = history.pop();
      if (!prev) return false;
      current = prev;
      bus.emit('back', { to: prev });
      return true;
    },
    popToRoot() {
      if (current === initial && history.length === 0) return false;
      const prev = current;
      history.length = 0;
      current = initial;
      bus.emit('change', { from: prev, to: initial, mode: 'replace' });
      return true;
    },
    sync(routeId) {
      const next = routeId && routeMap.has(routeId) ? routeId : initial;
      if (next === current) return false;
      history.length = 0;
      current = next;
      bus.emit('change', { from: null, to: next, mode: 'replace' });
      return true;
    },
    on(event, listener) {
      return bus.on(event, listener);
    },
  };
}

export function isFlow(route: AppRoute): boolean {
  return isFlowRoute(route);
}

export function isScreen(route: AppRoute): boolean {
  return isScreenRoute(route);
}
