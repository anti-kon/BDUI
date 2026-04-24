/**
 * Default http client backed by the global `fetch`. Works in modern Node (18+)
 * and browsers.
 */
export function createFetchHttpClient(fetchImpl) {
    const impl = fetchImpl ?? globalThis.fetch;
    if (!impl) {
        throw new Error('[runtime/http] fetch is not available in this environment.');
    }
    return async (request) => {
        const ctrl = new AbortController();
        const timeoutMs = request.timeoutMs ?? 30000;
        const t = timeoutMs > 0 && typeof globalThis.setTimeout === 'function'
            ? globalThis.setTimeout(() => ctrl.abort(), timeoutMs)
            : null;
        try {
            const response = await impl(request.url, {
                method: request.method,
                headers: request.headers,
                body: request.body == null ? undefined : JSON.stringify(request.body),
                signal: request.signal ?? ctrl.signal,
            });
            const headers = {};
            response.headers.forEach((value, name) => {
                headers[name] = value;
            });
            const contentType = headers['content-type'] ?? '';
            const body = contentType.includes('application/json')
                ? await response.json().catch(() => null)
                : await response.text().catch(() => '');
            return { status: response.status, headers, body };
        }
        finally {
            if (t !== null && typeof globalThis.clearTimeout === 'function') {
                globalThis.clearTimeout(t);
            }
        }
    };
}
//# sourceMappingURL=http.js.map