import type { BatchAction, WhenAction } from '@bdui/core';

import { evaluateGuard } from '../expression.js';
import type { ActionContext } from './context.js';

export async function handleBatch(ctx: ActionContext, action: BatchAction): Promise<void> {
  const atomic = action.params.atomic !== false;
  if (!atomic) {
    for (const sub of action.params.actions) await ctx.run(sub);
    return;
  }
  const snapshotFlow = { ...ctx.state.snapshot().flow };
  const snapshotSession = { ...ctx.state.snapshot().session };
  const snapshotLocal = { ...ctx.state.snapshot().local };
  try {
    for (const sub of action.params.actions) await ctx.run(sub);
  } catch (error) {
    ctx.state.replace('flow', snapshotFlow);
    ctx.state.replace('session', snapshotSession);
    ctx.state.replace('local', snapshotLocal);
    throw error;
  }
}

export async function handleWhen(ctx: ActionContext, action: WhenAction): Promise<void> {
  const pass = evaluateGuard(action.params.if, ctx.state.snapshot());
  const branch = pass ? action.params.then : action.params.else;
  if (!branch) return;
  for (const sub of branch) await ctx.run(sub);
}
