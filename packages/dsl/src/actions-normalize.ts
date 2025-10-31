import type { Action } from './types.js';
type Scope = 'local' | 'session' | 'flow';
type Target =
  | string
  | { scope: Scope; path: string }
  | { scope: Scope; path: string; __var?: true };

const SCOPES: readonly Scope[] = ['local', 'session', 'flow'];

function isScope(value: unknown): value is Scope {
  return typeof value === 'string' && (SCOPES as readonly string[]).includes(value);
}

function ensurePath(path: unknown): string {
  if (typeof path !== 'string' || !path.trim()) {
    throw new Error('Target path must be a non-empty string');
  }
  return path;
}

function parseTarget(target: Target): { scope: Scope; path: string } {
  if (typeof target === 'string') {
    const [scopeCandidate, ...rest] = target.split('.');
    if (!scopeCandidate || rest.length === 0) {
      throw new Error(`Invalid string target: "${target}"`);
    }
    if (!isScope(scopeCandidate)) {
      throw new Error(`Unsupported scope: "${scopeCandidate}"`);
    }
    const path = ensurePath(rest.join('.'));
    return { scope: scopeCandidate, path };
  }

  const scope = (target as any)?.scope;
  const path = (target as any)?.path;
  if (!isScope(scope)) {
    throw new Error(`Unsupported scope: "${String(scope)}"`);
  }
  return { scope, path: ensurePath(path) };
}

function isVar(x: any): x is { scope: Scope; path: string } {
  return x && typeof x === 'object' && typeof x.scope === 'string' && typeof x.path === 'string';
}

type ShortAction =
  | { set: [Target, any] }
  | { setVar: [any, any] }
  | { update: [any, (prev: any) => any] }
  | {
      navigate: [
        to: string,
        opts?: { mode?: 'push' | 'replace' | 'popToRoot'; params?: Record<string, unknown> },
      ];
    }
  | { back: true }
  | { replace: string }
  | { popToRoot: true }
  | { fetch: string }
  | {
      call: {
        url: string;
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
        body?: any;
        saveTo?: { scope: Scope; path: string };
        rollback?: ShortAction | Action;
      };
    }
  | {
      toast: [
        message: string,
        opts?: { level?: 'info' | 'success' | 'warning' | 'error'; durationMs?: number },
      ];
    }
  | { sync: any }
  | { validate: [schemaRef: string, target: Target] };

function isFullAction(a: any): a is Action {
  return a && typeof a === 'object' && typeof a.type === 'string';
}

function fnToString(f: Function): string {
  return String(f);
}

function normOne(literal: any): Action {
  if (isFullAction(literal)) return literal;

  if (!literal || typeof literal !== 'object') {
    throw new Error('Unknown action literal: ' + JSON.stringify(literal));
  }

  if ('set' in literal) {
    const [target, value] = literal.set as [Target, any];
    return { type: 'set', params: { target: parseTarget(target), value } };
  }

  if ('setVar' in literal) {
    const [vref, value] = literal.setVar as [any, any];
    if (isVar(vref)) {
      return { type: 'set', params: { target: parseTarget(vref), value } };
    }
  }

  if ('update' in literal) {
    const [vref, reducer] = literal.update as [any, Function];
    if (isVar(vref)) {
      return {
        type: 'update',
        params: { target: parseTarget(vref), reducer: fnToString(reducer) },
      };
    }
  }

  if ('navigate' in literal) {
    const [to, opts] = literal.navigate as [string, any?];
    return { type: 'navigate', params: { to, ...(opts || {}) } };
  }

  if ('back' in literal) return { type: 'back' };

  if ('replace' in literal) return { type: 'replace', params: { to: literal.replace as string } };

  if ('popToRoot' in literal) return { type: 'popToRoot' };

  if ('fetch' in literal) return { type: 'fetch', params: { sourceId: literal.fetch as string } };

  if ('call' in literal) {
    const call = literal.call as any;
    const action: Action = {
      type: 'callApi',
      params: {
        url: call.url,
        method: call.method,
        body: call.body,
        saveTo: call.saveTo,
      },
      rollbackAction: call.rollback ? normOne(call.rollback) : undefined,
    };
    return action;
  }

  if ('toast' in literal) {
    const [message, opts] = literal.toast as [string, any?];
    return { type: 'toast', params: { message, ...(opts || {}) } };
  }

  if ('sync' in literal) {
    return { type: 'sync', params: literal.sync };
  }

  if ('validate' in literal) {
    const [schemaRef, target] = literal.validate as [string, any];
    return { type: 'validate', params: { schemaRef, target: parseTarget(target) } };
  }

  throw new Error('Unknown action literal: ' + JSON.stringify(literal));
}

function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export function normalizeActions(input: any): Action[] {
  if (input == null) return [];
  return asArray(input).map((item) => normOne(item));
}
