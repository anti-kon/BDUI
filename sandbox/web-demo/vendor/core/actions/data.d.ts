/**
 * Data actions: declarative data-source fetches and arbitrary HTTP calls.
 */
import type { Action } from '../action.js';
import type { Expression } from '../expr.js';
import type { StateTarget } from '../state.js';
export interface FetchAction {
    readonly type: 'fetch';
    readonly params: {
        readonly sourceId: string;
        readonly params?: Readonly<Record<string, unknown>>;
        readonly saveTo?: StateTarget;
    };
}
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export interface CallAction {
    readonly type: 'call';
    readonly params: {
        readonly url: Expression<string>;
        readonly method: HttpMethod;
        readonly headers?: Readonly<Record<string, string>>;
        readonly body?: unknown;
        readonly saveTo?: StateTarget;
        readonly timeoutMs?: number;
    };
    readonly rollbackAction?: Action;
}
//# sourceMappingURL=data.d.ts.map