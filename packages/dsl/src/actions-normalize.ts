import type { Action, ExprRef, HttpMethod, ToastLevel } from '@bdui/core';

import type { ShortAction } from './short-action.js';
import { ensureExprRef, parseTarget, type Target } from './target.js';

export type { ShortAction } from './short-action.js';
export type { Target } from './target.js';
export { parseTarget } from './target.js';

function isFullAction(a: unknown): a is Action {
  return Boolean(a) && typeof a === 'object' && typeof (a as { type?: unknown }).type === 'string';
}

export function normalizeOne(literal: ShortAction | Action): Action {
  if (isFullAction(literal)) return literal;
  if (!literal || typeof literal !== 'object') {
    throw new Error(`Unknown action literal: ${JSON.stringify(literal)}`);
  }

  const l = literal as Record<string, unknown>;

  if ('set' in l) {
    const [target, value] = l.set as readonly [Target, unknown];
    return { type: 'set', params: { target: parseTarget(target), value } };
  }

  if ('reset' in l) {
    const [target, value] = l.reset as readonly [Target, unknown?];
    return { type: 'reset', params: { target: parseTarget(target), value } };
  }

  if ('inc' in l) {
    const raw = l.inc;
    const target: Target = Array.isArray(raw) ? (raw[0] as Target) : (raw as Target);
    const by = Array.isArray(raw) ? (raw[1] as number | ExprRef | undefined) : undefined;
    return { type: 'update.inc', params: { target: parseTarget(target), by } };
  }

  if ('dec' in l) {
    const raw = l.dec;
    const target: Target = Array.isArray(raw) ? (raw[0] as Target) : (raw as Target);
    const by = Array.isArray(raw) ? (raw[1] as number | ExprRef | undefined) : undefined;
    return { type: 'update.dec', params: { target: parseTarget(target), by } };
  }

  if ('toggle' in l) {
    return { type: 'update.toggle', params: { target: parseTarget(l.toggle as Target) } };
  }

  if ('append' in l) {
    const [target, value] = l.append as readonly [Target, unknown];
    return { type: 'update.append', params: { target: parseTarget(target), value } };
  }

  if ('merge' in l) {
    const [target, value] = l.merge as readonly [Target, Record<string, unknown> | ExprRef];
    return { type: 'update.merge', params: { target: parseTarget(target), value } };
  }

  if ('navigate' in l) {
    const [to, opts] = l.navigate as readonly [
      string,
      { mode?: 'push' | 'replace' | 'popToRoot'; params?: Record<string, unknown> }?,
    ];
    return { type: 'navigate', params: { to, ...(opts ?? {}) } };
  }

  if ('back' in l) return { type: 'back' };
  if ('replace' in l) return { type: 'replace', params: { to: l.replace as string } };
  if ('popToRoot' in l) return { type: 'popToRoot' };

  if ('fetch' in l) {
    const v = l.fetch;
    if (typeof v === 'string') return { type: 'fetch', params: { sourceId: v } };
    const fetch = v as {
      sourceId: string;
      params?: Record<string, unknown>;
      saveTo?: Target;
    };
    return {
      type: 'fetch',
      params: {
        sourceId: fetch.sourceId,
        params: fetch.params,
        saveTo: fetch.saveTo ? parseTarget(fetch.saveTo) : undefined,
      },
    };
  }

  if ('call' in l) {
    const call = l.call as {
      url: string | ExprRef;
      method: HttpMethod;
      headers?: Record<string, string>;
      body?: unknown;
      saveTo?: Target;
      timeoutMs?: number;
      rollback?: ShortAction;
    };
    const base: Action = {
      type: 'call',
      params: {
        url: call.url,
        method: call.method,
        headers: call.headers,
        body: call.body,
        saveTo: call.saveTo ? parseTarget(call.saveTo) : undefined,
        timeoutMs: call.timeoutMs,
      },
      ...(call.rollback ? { rollbackAction: normalizeOne(call.rollback) } : {}),
    };
    return base;
  }

  if ('toast' in l) {
    const [message, opts] = l.toast as readonly [
      string,
      { level?: ToastLevel; durationMs?: number }?,
    ];
    return { type: 'toast', params: { message, ...(opts ?? {}) } };
  }

  if ('sync' in l) {
    return { type: 'sync', params: (l.sync as Record<string, unknown>) ?? {} };
  }

  if ('validate' in l) {
    const [schemaRef, target] = l.validate as readonly [string, Target];
    return { type: 'validate', params: { schemaRef, target: parseTarget(target) } };
  }

  if ('modalOpen' in l) return { type: 'modal.open', params: { id: l.modalOpen as string } };
  if ('modalClose' in l) return { type: 'modal.close', params: { id: l.modalClose as string } };

  if ('prefetch' in l) {
    return { type: 'prefetchScreens', params: { screens: l.prefetch as readonly string[] } };
  }

  if ('batch' in l) {
    const list = l.batch as readonly ShortAction[];
    const atomic = (l as { atomic?: boolean }).atomic;
    return {
      type: 'batch',
      params: { actions: list.map(normalizeOne), ...(atomic !== undefined ? { atomic } : {}) },
    };
  }

  if ('when' in l) {
    const cfg = l.when as {
      if: ExprRef | string;
      then: readonly ShortAction[];
      else?: readonly ShortAction[];
    };
    return {
      type: 'when',
      params: {
        if: ensureExprRef(cfg.if),
        then: cfg.then.map(normalizeOne),
        ...(cfg.else ? { else: cfg.else.map(normalizeOne) } : {}),
      },
    };
  }

  if ('flowStart' in l) {
    const p = l.flowStart as { routeId: string; params?: Record<string, unknown> };
    return { type: 'flow.start', params: p };
  }
  if ('flowAdvance' in l) {
    const p = l.flowAdvance;
    return { type: 'flow.advance', params: p === true ? {} : (p as { routeId?: string }) };
  }
  if ('flowGoTo' in l) {
    const p = l.flowGoTo as { stepId: string; routeId?: string };
    return { type: 'flow.goTo', params: p };
  }
  if ('flowResume' in l) {
    const p = l.flowResume;
    return { type: 'flow.resume', params: p === true ? {} : (p as { routeId?: string }) };
  }
  if ('flowAbort' in l) {
    const p = l.flowAbort;
    return {
      type: 'flow.abort',
      params: p === true ? {} : (p as { reason?: string; routeId?: string }),
    };
  }
  if ('flowComplete' in l) {
    const p = l.flowComplete;
    return { type: 'flow.complete', params: p === true ? {} : (p as { routeId?: string }) };
  }

  throw new Error(`Unknown action literal: ${JSON.stringify(literal)}`);
}

function asArray<T>(value: T | readonly T[] | null | undefined): readonly T[] {
  if (value == null) return [];
  return Array.isArray(value) ? (value as readonly T[]) : ([value] as readonly T[]);
}

export function normalizeActions(
  input: ShortAction | Action | readonly (ShortAction | Action)[] | null | undefined,
): Action[] {
  if (input == null) return [];
  return asArray<ShortAction | Action>(input).map(normalizeOne);
}
