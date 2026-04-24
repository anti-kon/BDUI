import type { StorageAdapter } from '../adapter.js';
import { compareVersions } from '../semver.js';
import type { StoredContract } from '../types.js';

/** Fully in-memory adapter; suitable for tests and development. */
export class MemoryStorageAdapter implements StorageAdapter {
  private readonly byContract = new Map<string, StoredContract[]>();

  put(stored: StoredContract): StoredContract {
    const key = stored.contractId;
    const list = [...(this.byContract.get(key) ?? [])];
    const idx = list.findIndex((entry) => entry.version === stored.version);
    if (idx >= 0) {
      list.splice(idx, 1);
    }
    list.push(stored);
    list.sort((a, b) => compareVersions(b.version, a.version));
    this.byContract.set(key, list);
    return stored;
  }

  get(contractId: string, version: string): StoredContract | null {
    const list = this.byContract.get(contractId) ?? [];
    return list.find((entry) => entry.version === version) ?? null;
  }

  list(contractId: string): readonly StoredContract[] {
    return this.byContract.get(contractId) ?? [];
  }

  listIds(): readonly string[] {
    return Array.from(this.byContract.keys()).sort();
  }

  remove(contractId: string, version: string): boolean {
    const list = this.byContract.get(contractId);
    if (!list) return false;
    const idx = list.findIndex((entry) => entry.version === version);
    if (idx < 0) return false;
    list.splice(idx, 1);
    if (list.length === 0) this.byContract.delete(contractId);
    return true;
  }
}

export function createMemoryStorage(): StorageAdapter {
  return new MemoryStorageAdapter();
}
