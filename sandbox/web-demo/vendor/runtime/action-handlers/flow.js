export function handleFlowStart(ctx, action) {
    ctx.flow.activate(action.params.routeId);
    if (action.params.params)
        ctx.state.setParams(action.params.params);
    ctx.navigation.navigate(action.params.routeId, 'push');
    ctx.bus.emit('routeDirty', {});
}
export function handleFlowAdvance(ctx, action) {
    /* Handled by the renderer in concert with flow resolution. Emitting dirty
     * signals is enough — the platform will re-render and evaluate next step. */
    void action;
    ctx.bus.emit('routeDirty', {});
}
export function handleFlowGoTo(ctx, action) {
    const routeId = action.params.routeId ?? ctx.navigation.currentRoute;
    ctx.state.write('local', `__flow.${routeId}.current`, action.params.stepId);
    ctx.bus.emit('stateDirty', {});
}
export function handleFlowResume(ctx, action) {
    void action;
    ctx.bus.emit('routeDirty', {});
}
export function handleFlowAbort(ctx, action) {
    const routeId = action.params?.routeId ?? ctx.navigation.currentRoute;
    ctx.flow.deactivate(routeId);
    ctx.bus.emit('routeDirty', {});
}
export function handleFlowComplete(ctx, action) {
    const routeId = action.params?.routeId ?? ctx.navigation.currentRoute;
    ctx.flow.deactivate(routeId);
    ctx.bus.emit('routeDirty', {});
}
//# sourceMappingURL=flow.js.map