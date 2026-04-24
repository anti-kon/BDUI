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
export declare function createContractLoader(options: ContractLoaderOptions): ContractLoader;
//# sourceMappingURL=loader.d.ts.map