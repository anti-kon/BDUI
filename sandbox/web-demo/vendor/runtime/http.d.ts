import type { HttpMethod } from '@bdui/core';
export interface HttpRequest {
    readonly url: string;
    readonly method: HttpMethod;
    readonly headers?: Readonly<Record<string, string>>;
    readonly body?: unknown;
    readonly timeoutMs?: number;
    readonly signal?: AbortSignal;
}
export interface HttpResponse {
    readonly status: number;
    readonly headers: Readonly<Record<string, string>>;
    readonly body: unknown;
}
export type HttpClient = (request: HttpRequest) => Promise<HttpResponse>;
/**
 * Default http client backed by the global `fetch`. Works in modern Node (18+)
 * and browsers.
 */
export declare function createFetchHttpClient(fetchImpl?: typeof fetch): HttpClient;
//# sourceMappingURL=http.d.ts.map