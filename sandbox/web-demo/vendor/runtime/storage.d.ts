/**
 * Minimal storage adapter abstracting persistence for session state and
 * contract cache. Implementations MUST be synchronous for simplicity.
 */
export interface StorageAdapter {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}
/** In-memory storage. Handy for SSR and tests. */
export declare class MemoryStorageAdapter implements StorageAdapter {
    private readonly map;
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}
/**
 * Browser localStorage-backed adapter. Falls back to in-memory storage when
 * localStorage is unavailable (SSR, privacy mode, quota exceeded).
 */
export declare function createLocalStorageAdapter(): StorageAdapter;
//# sourceMappingURL=storage.d.ts.map