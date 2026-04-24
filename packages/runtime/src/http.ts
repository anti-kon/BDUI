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
export function createFetchHttpClient(fetchImpl?: typeof fetch): HttpClient {
  const impl = fetchImpl ?? (globalThis.fetch as typeof fetch | undefined);
  if (!impl) {
    throw new Error('[runtime/http] fetch is not available in this environment.');
  }
  return async (request) => {
    const ctrl = new AbortController();
    const timeoutMs = request.timeoutMs ?? 30000;
    const t =
      timeoutMs > 0 && typeof globalThis.setTimeout === 'function'
        ? globalThis.setTimeout(() => ctrl.abort(), timeoutMs)
        : null;
    try {
      const response = await impl(request.url, {
        method: request.method,
        headers: request.headers as Record<string, string> | undefined,
        body: request.body == null ? undefined : JSON.stringify(request.body),
        signal: request.signal ?? ctrl.signal,
      });
      const headers: Record<string, string> = {};
      response.headers.forEach((value, name) => {
        headers[name] = value;
      });
      const contentType = headers['content-type'] ?? '';
      const body = contentType.includes('application/json')
        ? await response.json().catch(() => null)
        : await response.text().catch(() => '');
      return { status: response.status, headers, body };
    } finally {
      if (t !== null && typeof globalThis.clearTimeout === 'function') {
        globalThis.clearTimeout(t);
      }
    }
  };
}
