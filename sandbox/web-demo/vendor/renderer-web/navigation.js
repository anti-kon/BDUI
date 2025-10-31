export function createNavigationController(navigation) {
  const routes = navigation.routes ?? [];
  const routeMap = new Map(routes.map((route) => [route.id, route]));
  const history = [];
  let current = navigation.initialRoute;
  function resolve(routeId) {
    return routeMap.get(routeId);
  }
  function transition(to, mode = 'push') {
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
