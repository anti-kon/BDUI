function cacheKey(prefix, url) {
    return `${prefix}${encodeURIComponent(url)}`;
}
export function createContractLoader(options) {
    const { storage, fetcher, cachePrefix = 'bdui_contract_', defaultTtlMs = 60_000, onRevalidate, } = options;
    const inflight = new Map();
    function readEntry(url) {
        const raw = storage.getItem(cacheKey(cachePrefix, url));
        if (!raw)
            return null;
        try {
            return JSON.parse(raw);
        }
        catch {
            return null;
        }
    }
    function writeEntry(url, entry) {
        try {
            storage.setItem(cacheKey(cachePrefix, url), JSON.stringify(entry));
        }
        catch {
            /* best-effort */
        }
    }
    async function fetchAndStore(url, currentEtag) {
        const result = await fetcher({ url, ifNoneMatch: currentEtag });
        if (result.notModified) {
            const existing = readEntry(url);
            if (existing) {
                const refreshed = { ...existing, cachedAt: Date.now() };
                writeEntry(url, refreshed);
                return { contract: existing.contract, source: 'cache' };
            }
        }
        const entry = {
            contract: result.contract,
            etag: result.etag,
            cachedAt: Date.now(),
            ttlMs: result.ttlMs ?? defaultTtlMs,
        };
        writeEntry(url, entry);
        return { contract: result.contract, source: 'network' };
    }
    async function load(url) {
        const existing = readEntry(url);
        const now = Date.now();
        const fresh = existing && now - existing.cachedAt < existing.ttlMs;
        if (existing && fresh) {
            return { contract: existing.contract, source: 'cache' };
        }
        if (existing && !fresh) {
            const background = (async () => {
                try {
                    const result = await fetchAndStore(url, existing.etag);
                    if (onRevalidate)
                        onRevalidate(result.contract);
                }
                catch {
                    /* swallow — stale is still valid */
                }
                finally {
                    inflight.delete(url);
                }
            })();
            inflight.set(url, background);
            return { contract: existing.contract, source: 'stale' };
        }
        const active = inflight.get(url);
        if (active)
            return active;
        const p = fetchAndStore(url).finally(() => inflight.delete(url));
        inflight.set(url, p);
        return p;
    }
    return {
        load,
        invalidate(url) {
            storage.removeItem(cacheKey(cachePrefix, url));
        },
    };
}
//# sourceMappingURL=loader.js.map