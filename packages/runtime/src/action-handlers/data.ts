import type { CallAction, DataSource, FetchAction } from '@bdui/core';

import type { ActionContext } from './context.js';
import { resolveValue } from './resolve.js';

export async function handleCall(ctx: ActionContext, action: CallAction): Promise<void> {
  if (!ctx.http) {
    ctx.bus.emit('error', { action, error: new Error('no HTTP client configured') });
    return;
  }
  const url = String(resolveValue(action.params.url, ctx.state) ?? '');
  const body = resolveValue(action.params.body, ctx.state);
  try {
    const response = await ctx.http({
      url,
      method: action.params.method,
      headers: action.params.headers,
      body,
      timeoutMs: action.params.timeoutMs,
    });
    if (response.status >= 400) {
      if (action.rollbackAction) await ctx.run(action.rollbackAction);
      ctx.bus.emit('error', {
        action,
        error: Object.assign(new Error(`HTTP ${response.status}`), { response }),
      });
      return;
    }
    if (action.params.saveTo) {
      ctx.state.set(action.params.saveTo, response.body);
      ctx.bus.emit('stateDirty', {});
    }
  } catch (error) {
    if (action.rollbackAction) await ctx.run(action.rollbackAction);
    ctx.bus.emit('error', { action, error });
  }
}

function dataSourceById(ctx: ActionContext, sourceId: string): DataSource | undefined {
  return ctx.contract?.dataSources?.find((source) => source.id === sourceId);
}

async function executeHttpDataSource(
  ctx: ActionContext,
  source: DataSource,
  params: Record<string, unknown>,
): Promise<unknown> {
  if (!ctx.http) throw new Error('no HTTP client configured');
  if (!source.url) throw new Error(`Data source "${source.id}" has no url`);
  const url = String(resolveValue(source.url, ctx.state, params) ?? '');
  const method = source.method ?? (source.kind === 'graphql' ? 'POST' : 'GET');
  const headers = resolveValue(source.headers, ctx.state, params) as
    | Readonly<Record<string, string>>
    | undefined;
  const body =
    source.body === undefined && source.kind === 'graphql'
      ? params
      : resolveValue(source.body, ctx.state, params);
  const response = await ctx.http({
    url,
    method,
    headers,
    body,
  });
  if (response.status >= 400) {
    throw Object.assign(new Error(`HTTP ${response.status}`), { response });
  }
  return response.body;
}

export async function handleFetch(ctx: ActionContext, action: FetchAction): Promise<void> {
  const source = dataSourceById(ctx, action.params.sourceId);
  if (!source) {
    ctx.bus.emit('error', {
      action,
      error: new Error(`Data source not found: ${action.params.sourceId}`),
    });
    return;
  }

  const params = (resolveValue(action.params.params ?? {}, ctx.state) ?? {}) as Record<
    string,
    unknown
  >;
  try {
    const result =
      source.kind === 'static'
        ? resolveValue(source.value, ctx.state, params)
        : await executeHttpDataSource(ctx, source, params);
    ctx.state.set(
      action.params.saveTo ?? { scope: 'local', path: `dataSources.${source.id}` },
      result,
    );
    ctx.bus.emit('stateDirty', {});
  } catch (error) {
    ctx.bus.emit('error', { action, error });
  }
}
