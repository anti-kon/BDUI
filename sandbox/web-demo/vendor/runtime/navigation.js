import { isFlowRoute, isScreenRoute } from '@bdui/core';
import { EventBus } from './events.js';
export function createNavigationController(navigation) {
    const routeMap = new Map(navigation.routes.map((r) => [r.id, r]));
    const history = [];
    const initial = navigation.initialRoute;
    let current = navigation.initialRoute;
    const bus = new EventBus();
    function transition(to, mode) {
        if (!routeMap.has(to))
            return false;
        if (to === current && mode === 'replace')
            return false;
        const from = current;
        if (mode === 'push' && from)
            history.push(from);
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
            if (!prev)
                return false;
            current = prev;
            bus.emit('back', { to: prev });
            return true;
        },
        popToRoot() {
            if (current === initial && history.length === 0)
                return false;
            const prev = current;
            history.length = 0;
            current = initial;
            bus.emit('change', { from: prev, to: initial, mode: 'replace' });
            return true;
        },
        sync(routeId) {
            const next = routeId && routeMap.has(routeId) ? routeId : initial;
            if (next === current)
                return false;
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
export function isFlow(route) {
    return isFlowRoute(route);
}
export function isScreen(route) {
    return isScreenRoute(route);
}
//# sourceMappingURL=navigation.js.map