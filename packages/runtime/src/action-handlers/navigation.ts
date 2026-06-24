import type { NavigateAction, ReplaceAction } from '@bdui/core';

import type { ActionContext } from './context.js';

export async function handleNavigate(ctx: ActionContext, action: NavigateAction): Promise<void> {
  const mode = action.params.mode ?? 'push';
  if (mode === 'popToRoot') {
    ctx.navigation.popToRoot();
    ctx.navigation.navigate(action.params.to, 'replace');
  } else {
    ctx.navigation.navigate(action.params.to, mode);
  }
  ctx.bus.emit('routeDirty', {});
}

export function handleReplace(ctx: ActionContext, action: ReplaceAction): void {
  ctx.navigation.replace(action.params.to);
  ctx.bus.emit('routeDirty', {});
}
