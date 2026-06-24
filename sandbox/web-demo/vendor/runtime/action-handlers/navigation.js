export async function handleNavigate(ctx, action) {
    const mode = action.params.mode ?? 'push';
    if (mode === 'popToRoot') {
        ctx.navigation.popToRoot();
        ctx.navigation.navigate(action.params.to, 'replace');
    }
    else {
        ctx.navigation.navigate(action.params.to, mode);
    }
    ctx.bus.emit('routeDirty', {});
}
export function handleReplace(ctx, action) {
    ctx.navigation.replace(action.params.to);
    ctx.bus.emit('routeDirty', {});
}
//# sourceMappingURL=navigation.js.map