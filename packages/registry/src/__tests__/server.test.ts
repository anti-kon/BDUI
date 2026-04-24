import type { Contract } from '@bdui/core';
import type { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createRegistryServer, MemoryStorageAdapter } from '../index.js';

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

describe('Registry HTTP API', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    const server = await createRegistryServer({
      storage: new MemoryStorageAdapter(),
      validate: false,
    });
    app = server.app;
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('responds to /v1/health', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ ok: true });
  });

  it('publishes a contract and returns 201 with etag', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/contracts',
      payload: { contract: mkContract('1.0.0') },
    });
    expect(res.statusCode).toBe(201);
    expect(res.headers.etag).toBeTruthy();
  });

  it('rejects bad publish with 400', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/contracts',
      payload: { contract: {} },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('BAD_REQUEST');
  });

  it('returns 422 for invalid contract (when validation enabled)', async () => {
    const srv = await createRegistryServer({
      storage: new MemoryStorageAdapter(),
      validate: true,
    });
    const res = await srv.app.inject({
      method: 'POST',
      url: '/v1/contracts',
      payload: {
        contract: {
          meta: {
            contractId: 'x',
            version: '1.0.0',
            schemaVersion: '1.0.0',
            generatedAt: 'not-iso',
          },
        },
      },
    });
    expect(res.statusCode).toBe(422);
    expect(res.json().error.code).toBe('VALIDATION_FAILED');
    await srv.app.close();
  });

  it('returns 304 for matching If-None-Match', async () => {
    await app.inject({
      method: 'POST',
      url: '/v1/contracts',
      payload: { contract: mkContract('1.0.0') },
    });
    const first = await app.inject({ method: 'GET', url: '/v1/contracts/demo' });
    expect(first.statusCode).toBe(200);
    const etag = first.headers.etag as string;
    const second = await app.inject({
      method: 'GET',
      url: '/v1/contracts/demo',
      headers: { 'if-none-match': etag },
    });
    expect(second.statusCode).toBe(304);
  });

  it('lists versions for a contract', async () => {
    await app.inject({
      method: 'POST',
      url: '/v1/contracts',
      payload: { contract: mkContract('1.0.0') },
    });
    await app.inject({
      method: 'POST',
      url: '/v1/contracts',
      payload: { contract: mkContract('1.1.0') },
    });
    const res = await app.inject({ method: 'GET', url: '/v1/versions?id=demo' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.items).toHaveLength(2);
    expect(body.items[0].version).toBe('1.1.0');
  });

  it('resolves via GET /v1/resolve with SemVer compatFrom', async () => {
    await app.inject({
      method: 'POST',
      url: '/v1/contracts',
      payload: { contract: mkContract('1.0.0') },
    });
    await app.inject({
      method: 'POST',
      url: '/v1/contracts',
      payload: { contract: mkContract('1.5.0') },
    });
    const res = await app.inject({
      method: 'GET',
      url: '/v1/resolve?id=demo&compatFrom=1.0.0&routeId=home',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.version).toBe('1.5.0');
    expect(body.resolved.type).toBe('screen');
  });

  it('returns 404 for missing contract', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/contracts/missing' });
    expect(res.statusCode).toBe(404);
    expect(res.json().error.code).toBe('NOT_FOUND');
  });

  it('requires bearer auth when configured but still allows health checks', async () => {
    const srv = await createRegistryServer({
      storage: new MemoryStorageAdapter(),
      validate: false,
      auth: { token: 'secret' },
    });
    await srv.app.ready();

    const health = await srv.app.inject({ method: 'GET', url: '/v1/health' });
    expect(health.statusCode).toBe(200);

    const denied = await srv.app.inject({ method: 'GET', url: '/v1/contracts' });
    expect(denied.statusCode).toBe(401);
    expect(denied.json().error.code).toBe('UNAUTHORIZED');

    const allowed = await srv.app.inject({
      method: 'GET',
      url: '/v1/contracts',
      headers: { authorization: 'Bearer secret' },
    });
    expect(allowed.statusCode).toBe(200);

    await srv.app.close();
  });

  it('does not enable permissive CORS by default', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/health',
      headers: { origin: 'https://example.com' },
    });
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
