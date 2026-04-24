import type { Contract } from '@bdui/core';
import type { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createRegistryServer, MemoryStorageAdapter, RegistryClient } from '../index.js';

function mkContract(version: string): Contract {
  return {
    meta: {
      contractId: 'demo',
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

describe('RegistryClient', () => {
  let app: FastifyInstance;
  let baseUrl: string;
  let client: RegistryClient;

  beforeEach(async () => {
    const server = await createRegistryServer({
      storage: new MemoryStorageAdapter(),
      validate: false,
    });
    app = server.app;
    await app.listen({ port: 0, host: '127.0.0.1' });
    const address = app.server.address();
    if (typeof address === 'string' || !address) {
      throw new Error('failed to bind test server');
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
    client = new RegistryClient({ baseUrl });
  });

  afterEach(async () => {
    await app.close();
  });

  it('publishes and lists versions', async () => {
    const first = await client.publish({ contract: mkContract('1.0.0') });
    expect(first.version).toBe('1.0.0');
    await client.publish({ contract: mkContract('1.1.0') });
    const versions = await client.listVersions('demo');
    expect(versions.map((v) => v.version)).toEqual(['1.1.0', '1.0.0']);
  });

  it('resolves latest version and returns etag', async () => {
    await client.publish({ contract: mkContract('1.0.0') });
    await client.publish({ contract: mkContract('1.2.3') });
    const resolved = await client.resolve({ contractId: 'demo' });
    expect(resolved.version).toBe('1.2.3');
    expect(resolved.etag).toBeTruthy();
  });

  it('short-circuits on If-None-Match', async () => {
    await client.publish({ contract: mkContract('1.0.0') });
    const initial = await client.getContract('demo');
    const second = await client.getContract('demo', undefined, initial.etag);
    expect(second.notModified).toBe(true);
    expect(second.status).toBe(304);
  });

  it('throws on 404', async () => {
    await expect(client.getContract('missing')).rejects.toThrow();
  });
});
