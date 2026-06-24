import type { Action, ExprRef, HttpMethod, ToastLevel } from '@bdui/core';

import type { Target } from './target.js';

/**
 * SAL shorthands: ergonomic action literals authors can write in TSX. Every
 * shorthand is normalised to a canonical {@link Action} by `normalizeOne`.
 */
export type ShortAction =
  | Action
  | { readonly set: readonly [Target, unknown] }
  | { readonly reset: readonly [Target, unknown?] }
  | { readonly inc: Target | readonly [Target, number | ExprRef] }
  | { readonly dec: Target | readonly [Target, number | ExprRef] }
  | { readonly toggle: Target }
  | { readonly append: readonly [Target, unknown] }
  | { readonly merge: readonly [Target, Record<string, unknown> | ExprRef] }
  | {
      readonly navigate: readonly [
        string,
        { mode?: 'push' | 'replace' | 'popToRoot'; params?: Record<string, unknown> }?,
      ];
    }
  | { readonly back: true }
  | { readonly replace: string }
  | { readonly popToRoot: true }
  | {
      readonly fetch:
        | string
        | { sourceId: string; params?: Record<string, unknown>; saveTo?: Target };
    }
  | {
      readonly call: {
        url: string | ExprRef;
        method: HttpMethod;
        headers?: Record<string, string>;
        body?: unknown;
        saveTo?: Target;
        timeoutMs?: number;
        rollback?: ShortAction;
      };
    }
  | {
      readonly toast: readonly [string, { level?: ToastLevel; durationMs?: number }?];
    }
  | { readonly sync: Record<string, unknown> | undefined }
  | { readonly validate: readonly [string, Target] }
  | { readonly modalOpen: string }
  | { readonly modalClose: string }
  | { readonly prefetch: readonly string[] }
  | { readonly batch: readonly ShortAction[]; readonly atomic?: boolean }
  | {
      readonly when: {
        if: ExprRef | string;
        then: readonly ShortAction[];
        else?: readonly ShortAction[];
      };
    }
  | { readonly flowStart: { routeId: string; params?: Record<string, unknown> } }
  | { readonly flowAdvance: { routeId?: string } | true }
  | { readonly flowGoTo: { stepId: string; routeId?: string } }
  | { readonly flowResume: { routeId?: string } | true }
  | { readonly flowAbort: { reason?: string; routeId?: string } | true }
  | { readonly flowComplete: { routeId?: string } | true };
