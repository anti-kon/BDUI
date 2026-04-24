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
export class MemoryStorageAdapter implements StorageAdapter {
  private readonly map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }
}

/**
 * Browser localStorage-backed adapter. Falls back to in-memory storage when
 * localStorage is unavailable (SSR, privacy mode, quota exceeded).
 */
export function createLocalStorageAdapter(): StorageAdapter {
  const ls = (globalThis as { localStorage?: Storage }).localStorage;
  if (!ls) return new MemoryStorageAdapter();
  return {
    getItem(key) {
      try {
        return ls.getItem(key);
      } catch {
        return null;
      }
    },
    setItem(key, value) {
      try {
        ls.setItem(key, value);
      } catch {
        /* quota or unavailable — silent */
      }
    },
    removeItem(key) {
      try {
        ls.removeItem(key);
      } catch {
        /* ignore */
      }
    },
  };
}
