export function isFlowRoute(route) {
    return route.type === 'flow';
}
export function isScreenRoute(route) {
    return !isFlowRoute(route);
}
//# sourceMappingURL=navigation.js.map