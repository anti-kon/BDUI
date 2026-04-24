import type { Contract } from '@bdui/core';
import { describe, expect, it } from 'vitest';

import { computeEtag, ContractStore, MemoryStorageAdapter, RegistryError } from '../index.js';

function mkContract(version: string, contractId = 'demo'): Contract {
  return {
    meta: {
      contractId,
      version,
      schemaVersion: '1.0.0',
      generatedAt: '2026-01-01T00:00:00Z',
    },
    navigation: {
      initialRoute: 'home',
      routes: [{ id: 'home', node: { type: 'Column', children: [] } } as unknown as never],
    },
  };
}

describe('ContractStore', () => {
  it('publishes and retrieves contracts', async () => {
    const storage = new MemoryStorageAdapter();
    const store = new ContractStore({ storage, validate: false });
    const saved = await store.publish({ contract: mkContract('1.0.0'), tags: ['beta'] });
    expect(saved.etag).toBe(computeEtag(mkContract('1.0.0')));
    const fetched = await store.getVersion('demo', '1.0.0');
    expect(fetched.version).toBe('1.0.0');
    expect(fetched.tags).toContain('beta');
  });

  it('rejects duplicate versions with CONFLICT', async () => {
    const store = new ContractStore({ storage: new MemoryStorageAdapter(), validate: false });
    await store.publish({ contract: mkContract('1.0.0') });
    await expect(store.publish({ contract: mkContract('1.0.0') })).rejects.toBeInstanceOf(
      RegistryError,
    );
  });

  it('rejects non-SemVer versions with BAD_REQUEST', async () => {
    const store = new ContractStore({ storage: new MemoryStorageAdapter(), validate: false });
    await expect(
      store.publish({
        contract: { ...mkContract('1.0'), meta: { ...mkContract('1.0').meta, version: 'banana' } },
      }),
    ).rejects.toBeInstanceOf(RegistryError);
  });

  it('resolves latest SemVer version', async () => {
    const store = new ContractStore({ storage: new MemoryStorageAdapter(), validate: false });
    await store.publish({ contract: mkContract('1.0.0') });
    await store.publish({ contract: mkContract('1.2.3') });
    await store.publish({ contract: mkContract('1.1.0') });
    const latest = await store.resolveVersion('demo');
    expect(latest.version).toBe('1.2.3');
  });

  it('filters by compatFrom (same major, >= minor)', async () => {
    const store = new ContractStore({ storage: new MemoryStorageAdapter(), validate: false });
    await store.publish({ contract: mkContract('1.0.0') });
    await store.publish({ contract: mkContract('1.4.0') });
    await store.publish({ contract: mkContract('2.0.0') });
    const resolved = await store.resolveVersion('demo', undefined, '1.2.0');
    expect(resolved.version).toBe('1.4.0');
  });

  it('returns NOT_FOUND when compatFrom has no match', async () => {
    const store = new ContractStore({ storage: new MemoryStorageAdapter(), validate: false });
    await store.publish({ contract: mkContract('2.0.0') });
    await expect(store.resolveVersion('demo', undefined, '1.0.0')).rejects.toBeInstanceOf(
      RegistryError,
    );
  });
});
