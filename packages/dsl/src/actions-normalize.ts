import type { Action } from './types';

type Scope = 'local'|'session'|'flow';
type Target = string | { scope: Scope; path: string };

function parseTarget(t: Target): { scope: Scope; path: string } {
  if (typeof t === 'string') {
    const [scope, ...rest] = t.split('.');
    return { scope: scope as Scope, path: rest.join('.') };
  }
  return t;
}

type ShortAction =
  | { set: [Target, any] }
  | { navigate: [to: string, opts?: { mode?: 'push'|'replace'|'popToRoot'; params?: Record<string, unknown> }] }
  | { back: true }
  | { replace: string }
  | { popToRoot: true }
  | { fetch: string }
  | { call: { url: string; method: 'GET'|'POST'|'PUT'|'PATCH'|'DELETE'; body?: any; saveTo?: { scope: Scope; path: string }; rollback?: ShortAction | Action } }
  | { toast: [message: string, opts?: { level?: 'info'|'success'|'warning'|'error'; durationMs?: number }] }
  | { sync: any }
  | { validate: [schemaRef: string, target: Target] };

function isFullAction(a: any): a is Action {
  return a && typeof a === 'object' && typeof a.type === 'string';
}

function normOne(a: any): Action {
  if (isFullAction(a)) return a;

  if (a && typeof a === 'object') {
    if ('set' in a) {
      const [t, v] = a.set as [Target, any];
      return { type: 'set', params: { target: parseTarget(t), value: v } } as Action;
    }
    if ('navigate' in a) {
      const [to, opts] = a.navigate as [string, any?];
      return { type: 'navigate', params: { to, ...(opts || {}) } } as Action;
    }
    if ('back' in a) return { type: 'back' } as Action;
    if ('replace' in a) return { type: 'replace', params: { to: a.replace as string } } as Action;
    if ('popToRoot' in a) return { type: 'popToRoot' } as Action;
    if ('fetch' in a) return { type: 'fetch', params: { sourceId: a.fetch as string } } as Action;
    if ('call' in a) {
      const c = a.call as any;
      const out: any = { type: 'callApi', params: {
        url: c.url, method: c.method, body: c.body, saveTo: c.saveTo
      }};
      if (c.rollback) out.rollbackAction = normOne(c.rollback);
      return out as Action;
    }
    if ('toast' in a) {
      const [message, opts] = a.toast as [string, any?];
      return { type: 'toast', params: { message, ...(opts||{}) } } as Action;
    }
    if ('sync' in a) {
      return { type: 'sync', params: a.sync } as Action;
    }
    if ('validate' in a) {
      const [schemaRef, target] = a.validate as [string, any];
      return { type: 'validate', params: { schemaRef, target: parseTarget(target) } } as Action;
    }
  }
  throw new Error('Unknown action literal: ' + JSON.stringify(a));
}

export function normalizeActions(input: any): Action[] {
  if (input == null) return [];
  const arr = Array.isArray(input) ? input : [input];
  return arr.flatMap((x) => [normOne(x)]);
}
