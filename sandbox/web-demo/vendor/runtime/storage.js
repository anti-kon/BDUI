/** In-memory storage. Handy for SSR and tests. */
export class MemoryStorageAdapter {
    map = new Map();
    getItem(key) {
        return this.map.has(key) ? this.map.get(key) : null;
    }
    setItem(key, value) {
        this.map.set(key, value);
    }
    removeItem(key) {
        this.map.delete(key);
    }
}
/**
 * Browser localStorage-backed adapter. Falls back to in-memory storage when
 * localStorage is unavailable (SSR, privacy mode, quota exceeded).
 */
export function createLocalStorageAdapter() {
    const ls = globalThis.localStorage;
    if (!ls)
        return new MemoryStorageAdapter();
    return {
        getItem(key) {
            try {
                return ls.getItem(key);
            }
            catch {
                return null;
            }
        },
        setItem(key, value) {
            try {
                ls.setItem(key, value);
            }
            catch {
                /* quota or unavailable — silent */
            }
        },
        removeItem(key) {
            try {
                ls.removeItem(key);
            }
            catch {
                /* ignore */
            }
        },
    };
}
//# sourceMappingURL=storage.js.map