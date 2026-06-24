import type {
  ModalCloseAction,
  ModalOpenAction,
  PrefetchScreensAction,
  ToastAction,
} from '@bdui/core';

import { evaluate } from '../expression.js';
import type { ActionContext } from './context.js';

export function handleToast(ctx: ActionContext, action: ToastAction): void {
  const message = String(evaluate(action.params.message, ctx.state.snapshot()) ?? '');
  ctx.toast.show({ message, level: action.params.level, durationMs: action.params.durationMs });
}

export function handleModalOpen(ctx: ActionContext, action: ModalOpenAction): void {
  ctx.modal.open(action.params.id);
}

export function handleModalClose(ctx: ActionContext, action: ModalCloseAction): void {
  ctx.modal.close(action.params.id);
}

export async function handlePrefetch(
  ctx: ActionContext,
  action: PrefetchScreensAction,
): Promise<void> {
  if (ctx.prefetchScreens) await ctx.prefetchScreens(action.params.screens);
}
