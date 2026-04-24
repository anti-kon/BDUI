import type { Contract } from '@bdui/core';
import { describe, expect, it } from 'vitest';

import { createRuntimeStateController, MemoryStorageAdapter } from '../index.js';

function contract(): Contract {
  return {
    meta: {
      contractId: 'test',
      version: '1.0.0',
      schemaVersion: '1.0.0',
      generatedAt: '2026-01-01T00:00:00Z',
    },
    navigation: { initialRoute: 'home', routes: [] },
    initial: { flow: { counter: 0 }, session: { name: 'A' } },
  };
}

describe('createRuntimeStateController', () => {
  it('reads and writes scoped state', () => {
    const ctl = createRuntimeStateController({ contract: contract() });
    expect(ctl.read('flow', 'counter')).toBe(0);
    ctl.write('flow', 'counter', 3);
    expect(ctl.read('flow', 'counter')).toBe(3);
  });

  it('persists session state to storage', () => {
    const storage = new MemoryStorageAdapter();
    const ctl = createRuntimeStateController({
      contract: contract(),
      storage,
      sessionKey: 'session',
    });
    ctl.write('session', 'name', 'B');
    expect(storage.getItem('session')).toBe(JSON.stringify({ name: 'B' }));
  });

  it('rehydrates session state from storage', () => {
    const storage = new MemoryStorageAdapter();
    storage.setItem('session', JSON.stringify({ name: 'Restored' }));
    const ctl = createRuntimeStateController({
      contract: contract(),
      storage,
      sessionKey: 'session',
    });
    expect(ctl.read('session', 'name')).toBe('Restored');
  });

  it('emits change events', () => {
    const ctl = createRuntimeStateController({ contract: contract() });
    const events: unknown[] = [];
    ctl.on('change', (e) => events.push(e));
    ctl.write('flow', 'counter', 5);
    expect(events.length).toBeGreaterThan(0);
  });
});
