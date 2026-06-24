import type {
  ResetAction,
  SetAction,
  SyncAction,
  UpdateAppendAction,
  UpdateDecAction,
  UpdateIncAction,
  UpdateMapPathAction,
  UpdateMergeAction,
  UpdateToggleAction,
} from '@bdui/core';

import { evaluate } from '../expression.js';
import type { ActionContext } from './context.js';
import { resolveValue, toNumber } from './resolve.js';

export function handleSet(ctx: ActionContext, action: SetAction): void {
  const resolved = resolveValue(action.params.value, ctx.state);
  ctx.state.set(action.params.target, resolved);
  ctx.bus.emit('stateDirty', {});
}

export function handleReset(ctx: ActionContext, action: ResetAction): void {
  ctx.state.set(action.params.target, action.params.value ?? undefined);
  ctx.bus.emit('stateDirty', {});
}

export function handleInc(ctx: ActionContext, action: UpdateIncAction): void {
  const current = ctx.state.get(action.params.target);
  const byRaw = action.params.by;
  const by = byRaw === undefined ? 1 : toNumber(evaluate(byRaw, ctx.state.snapshot()));
  ctx.state.set(action.params.target, toNumber(current) + by);
  ctx.bus.emit('stateDirty', {});
}

export function handleDec(ctx: ActionContext, action: UpdateDecAction): void {
  const current = ctx.state.get(action.params.target);
  const byRaw = action.params.by;
  const by = byRaw === undefined ? 1 : toNumber(evaluate(byRaw, ctx.state.snapshot()));
  ctx.state.set(action.params.target, toNumber(current) - by);
  ctx.bus.emit('stateDirty', {});
}

export function handleToggle(ctx: ActionContext, action: UpdateToggleAction): void {
  const current = ctx.state.get(action.params.target);
  ctx.state.set(action.params.target, !current);
  ctx.bus.emit('stateDirty', {});
}

export function handleAppend(ctx: ActionContext, action: UpdateAppendAction): void {
  const current = ctx.state.get(action.params.target);
  const list = Array.isArray(current) ? [...current] : [];
  list.push(resolveValue(action.params.value, ctx.state));
  ctx.state.set(action.params.target, list);
  ctx.bus.emit('stateDirty', {});
}

export function handleMerge(ctx: ActionContext, action: UpdateMergeAction): void {
  const current = ctx.state.get(action.params.target);
  const patch = resolveValue(action.params.value, ctx.state) as Record<string, unknown>;
  const base =
    current !== null && typeof current === 'object' && !Array.isArray(current)
      ? (current as Record<string, unknown>)
      : {};
  ctx.state.set(action.params.target, { ...base, ...patch });
  ctx.bus.emit('stateDirty', {});
}

export function handleMapPath(ctx: ActionContext, action: UpdateMapPathAction): void {
  const current = ctx.state.get(action.params.target);
  if (!current || typeof current !== 'object' || Array.isArray(current)) return;
  const src = current as Record<string, unknown>;
  let out: Record<string, unknown> = { ...(action.params.defaults ?? {}), ...src };
  if (action.params.pick) {
    const picked: Record<string, unknown> = {};
    for (const key of action.params.pick) {
      if (key in out) picked[key] = out[key];
    }
    out = picked;
  }
  if (action.params.rename) {
    const renamed: Record<string, unknown> = {};
    for (const [from, to] of Object.entries(action.params.rename)) {
      if (from in out) renamed[to] = out[from];
    }
    out = { ...out, ...renamed };
    for (const key of Object.keys(action.params.rename)) {
      delete out[key];
    }
  }
  ctx.state.set(action.params.target, out);
  ctx.bus.emit('stateDirty', {});
}

export function handleSync(ctx: ActionContext, _action: SyncAction): void {
  ctx.state.persistSession();
}
