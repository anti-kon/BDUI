import type { Contract } from '@bdui/core';

import type { StorageAdapter } from './storage.js';

export interface ContractCacheEntry {
  readonly contract: Contract;
  readonly etag?: string;
  readonly cachedAt: number;
  readonly ttlMs: number;
}

export interface ContractFetchResult {
  readonly contract: Contract;
  readonly etag?: string;
  readonly ttlMs?: number;
  readonly notModified?: boolean;
}

export type ContractFetcher = (args: {
  readonly url: string;
  readonly ifNoneMatch?: string;
}) => Promise<ContractFetchResult>;

export interface ContractLoaderOptions {
  readonly storage: StorageAdapter;
  readonly fetcher: ContractFetcher;
  readonly cachePrefix?: string;
  readonly defaultTtlMs?: number;
  readonly onRevalidate?: (contract: Contract) => void;
}

export interface LoadResult {
  readonly contract: Contract;
  readonly source: 'network' | 'cache' | 'stale';
}

export interface ContractLoader {
  /**
   * Resolve a contract using stale-while-revalidate semantics:
   *   1. If a fresh cache entry exists, return it immediately (no fetch).
   *   2. If a stale cache entry exists, return it and fire a background refetch.
   *   3. Otherwise, fetch synchronously from network.
   */
  load(url: string): Promise<LoadResult>;
  invalidate(url: string): void;
}

function cacheKey(prefix: string, url: string): string {
  return `${prefix}${encodeURIComponent(url)}`;
}

export function createContractLoader(options: ContractLoaderOptions): ContractLoader {
  const {
    storage,
    fetcher,
    cachePrefix = 'bdui_contract_',
    defaultTtlMs = 60_000,
    onRevalidate,
  } = options;

  const inflight = new Map<string, Promise<LoadResult>>();

  function readEntry(url: string): ContractCacheEntry | null {
    const raw = storage.getItem(cacheKey(cachePrefix, url));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ContractCacheEntry;
    } catch {
      return null;
    }
  }

  function writeEntry(url: string, entry: ContractCacheEntry): void {
    try {
      storage.setItem(cacheKey(cachePrefix, url), JSON.stringify(entry));
    } catch {
      /* best-effort */
    }
  }

  async function fetchAndStore(url: string, currentEtag?: string): Promise<LoadResult> {
    const result = await fetcher({ url, ifNoneMatch: currentEtag });
    if (result.notModified) {
      const existing = readEntry(url);
      if (existing) {
        const refreshed: ContractCacheEntry = { ...existing, cachedAt: Date.now() };
        writeEntry(url, refreshed);
        return { contract: existing.contract, source: 'cache' };
      }
    }
    const entry: ContractCacheEntry = {
      contract: result.contract,
      etag: result.etag,
      cachedAt: Date.now(),
      ttlMs: result.ttlMs ?? defaultTtlMs,
    };
    writeEntry(url, entry);
    return { contract: result.contract, source: 'network' };
  }

  async function load(url: string): Promise<LoadResult> {
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
          if (onRevalidate) onRevalidate(result.contract);
        } catch {
          /* swallow — stale is still valid */
        } finally {
          inflight.delete(url);
        }
      })();
      inflight.set(url, background as unknown as Promise<LoadResult>);
      return { contract: existing.contract, source: 'stale' };
    }

    const active = inflight.get(url);
    if (active) return active;
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
