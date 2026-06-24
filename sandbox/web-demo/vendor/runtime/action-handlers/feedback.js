import { evaluate } from '../expression.js';
export function handleToast(ctx, action) {
    const message = String(evaluate(action.params.message, ctx.state.snapshot()) ?? '');
    ctx.toast.show({ message, level: action.params.level, durationMs: action.params.durationMs });
}
export function handleModalOpen(ctx, action) {
    ctx.modal.open(action.params.id);
}
export function handleModalClose(ctx, action) {
    ctx.modal.close(action.params.id);
}
export async function handlePrefetch(ctx, action) {
    if (ctx.prefetchScreens)
        await ctx.prefetchScreens(action.params.screens);
}
//# sourceMappingURL=feedback.js.map