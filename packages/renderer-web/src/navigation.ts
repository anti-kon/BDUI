import type { AppRoute, Navigation as NavigationConfig } from '@bdui/common';

export type NavigationController = {
  readonly currentRoute: string;
  readonly routes: AppRoute[];
  navigate(to: string, mode?: 'push' | 'replace'): boolean;
  replace(to: string): boolean;
  back(): boolean;
  popToRoot(): boolean;
  sync(routeId?: string | null): boolean;
  resolve(routeId: string): AppRoute | undefined;
};

export function createNavigationController(navigation: NavigationConfig): NavigationController {
  const routes = navigation.routes ?? [];
  const routeMap = new Map<string, AppRoute>(
    routes.map((route: AppRoute) => [route.id, route] as const),
  );
  const history: string[] = [];
  let current = navigation.initialRoute;

  function resolve(routeId: string): AppRoute | undefined {
    return routeMap.get(routeId);
  }

  function transition(to: string, mode: 'push' | 'replace' = 'push'): boolean {
    if (!routeMap.has(to)) {
      console.warn(`[bdui/renderer-web] Unknown route: ${to}`);
      return false;
    }
    if (to === current && mode !== 'push') {
      return false;
    }
    if (mode === 'push' && current) {
      history.push(current);
    }
    current = to;
    return true;
  }

  return {
    get currentRoute() {
      return current;
    },
    routes,
    navigate(to, mode = 'push') {
      return transition(to, mode);
    },
    replace(to) {
      return transition(to, 'replace');
    },
    back() {
      const prev = history.pop();
      if (!prev) {
        return false;
      }
      current = prev;
      return true;
    },
    popToRoot() {
      if (current === navigation.initialRoute && history.length === 0) {
        return false;
      }
      history.length = 0;
      current = navigation.initialRoute;
      return true;
    },
    sync(routeId) {
      const next = routeId && resolve(routeId) ? routeId : navigation.initialRoute;
      if (next === current) {
        return false;
      }
      current = next;
      history.length = 0;
      return true;
    },
    resolve,
  };
}
