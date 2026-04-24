import type { Contract } from '@bdui/core';
import { describe, expect, it, vi } from 'vitest';

import { createContractLoader, MemoryStorageAdapter } from '../index.js';

function mkContract(version: string): Contract {
  return {
    meta: {
      contractId: 'app',
      version,
      schemaVersion: '1.0.0',
      generatedAt: '2026-01-01T00:00:00Z',
    },
    navigation: { initialRoute: 'home', routes: [] },
  };
}

describe('ContractLoader', () => {
  it('fetches and caches contracts', async () => {
    const storage = new MemoryStorageAdapter();
    const fetcher = vi.fn().mockResolvedValue({ contract: mkContract('1.0.0'), ttlMs: 10_000 });
    const loader = createContractLoader({ storage, fetcher });
    const first = await loader.load('/contract.json');
    expect(first.source).toBe('network');
    const second = await loader.load('/contract.json');
    expect(second.source).toBe('cache');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('serves stale cache and revalidates in background', async () => {
    const storage = new MemoryStorageAdapter();
    let fetchCount = 0;
    const loader = createContractLoader({
      storage,
      fetcher: async () => {
        fetchCount++;
        return { contract: mkContract(`1.0.${fetchCount}`), ttlMs: 1 };
      },
    });
    await loader.load('/c.json');
    await new Promise((resolve) => setTimeout(resolve, 5));
    const stale = await loader.load('/c.json');
    expect(stale.source).toBe('stale');
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(fetchCount).toBeGreaterThanOrEqual(2);
  });

  it('invalidates cached entries', async () => {
    const storage = new MemoryStorageAdapter();
    const fetcher = vi.fn().mockResolvedValue({ contract: mkContract('1.0.0'), ttlMs: 10_000 });
    const loader = createContractLoader({ storage, fetcher });
    await loader.load('/c.json');
    loader.invalidate('/c.json');
    await loader.load('/c.json');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
