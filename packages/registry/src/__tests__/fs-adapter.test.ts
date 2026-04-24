import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { FileSystemStorageAdapter } from '../adapters/fs.js';

describe('FileSystemStorageAdapter', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bdui-registry-'));
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('persists and reads back contracts', async () => {
    const adapter = new FileSystemStorageAdapter({ rootDir: dir });
    await adapter.put({
      contractId: 'app',
      version: '1.0.0',
      contract: {
        meta: {
          contractId: 'app',
          version: '1.0.0',
          schemaVersion: '1.0.0',
          generatedAt: '2026-01-01T00:00:00Z',
        },
        navigation: { initialRoute: 'home', routes: [] },
      },
      etag: '"abc"',
      createdAt: '2026-01-01T00:00:00Z',
      tags: ['a'],
      compatFrom: undefined,
    });
    const loaded = await adapter.get('app', '1.0.0');
    expect(loaded?.etag).toBe('"abc"');
    expect(loaded?.tags).toContain('a');
  });

  it('lists versions newest first', async () => {
    const adapter = new FileSystemStorageAdapter({ rootDir: dir });
    for (const version of ['1.0.0', '2.1.0', '1.5.0']) {
      await adapter.put({
        contractId: 'app',
        version,
        contract: {
          meta: {
            contractId: 'app',
            version,
            schemaVersion: '1.0.0',
            generatedAt: '2026-01-01T00:00:00Z',
          },
          navigation: { initialRoute: 'home', routes: [] },
        },
        etag: `"${version}"`,
        createdAt: '2026-01-01T00:00:00Z',
        tags: [],
      });
    }
    const list = await adapter.list('app');
    expect(list.map((entry) => entry.version)).toEqual(['2.1.0', '1.5.0', '1.0.0']);
  });

  it('removes a version', async () => {
    const adapter = new FileSystemStorageAdapter({ rootDir: dir });
    await adapter.put({
      contractId: 'app',
      version: '1.0.0',
      contract: {
        meta: {
          contractId: 'app',
          version: '1.0.0',
          schemaVersion: '1.0.0',
          generatedAt: '2026-01-01T00:00:00Z',
        },
        navigation: { initialRoute: 'home', routes: [] },
      },
      etag: '"abc"',
      createdAt: '2026-01-01T00:00:00Z',
      tags: [],
    });
    expect(await adapter.remove('app', '1.0.0')).toBe(true);
    expect(await adapter.get('app', '1.0.0')).toBeNull();
  });
});
