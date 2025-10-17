import { validateContract } from '@bdui/schema';
import type { FastifyInstance } from 'fastify';

import { resolveRouteNode } from './flowEngine.js';
import { getContract, putContract } from './store.js';

export default async function routes(app: FastifyInstance) {
  app.get('/v1/health', async () => ({ ok: true }));

  app.post('/v1/contracts', async (req, rep) => {
    const body: any = req.body;
    const { contract, tags } = body || {};
    if (!contract) return rep.code(400).send({ error: 'contract is required' });

    const res = validateContract(contract);
    if (!res.ok) return rep.code(400).send({ error: 'invalid contract', details: res.errors });

    const saved = putContract(contract, Array.isArray(tags) ? tags : []);
    return rep
      .code(201)
      .send({ id: saved.id, version: saved.version, etag: saved.etag, createdAt: saved.createdAt });
  });

  app.get('/v1/contracts/:id', async (req, rep) => {
    const { id } = req.params as any;
    const s = getContract(id);
    if (!s) return rep.code(404).send({ error: 'not found' });
    rep.header('ETag', s.etag);
    rep.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return s.contract;
  });

  app.get('/v1/contracts/:id/:version', async (req, rep) => {
    const { id, version } = req.params as any;
    const s = getContract(id, version);
    if (!s) return rep.code(404).send({ error: 'not found' });
    rep.header('ETag', s.etag);
    rep.header('Cache-Control', 'public, immutable, max-age=31536000');
    return s.contract;
  });

  app.post('/v1/resolve', async (req, rep) => {
    const { contractId, version, routeId, state, currentStepId } = (req.body || {}) as any;
    const s = getContract(contractId, version);
    if (!s) return rep.code(404).send({ error: 'not found' });

    const resolved = resolveRouteNode(s.contract, routeId, state, currentStepId);
    return { contractId, version: s.version, routeId, resolved };
  });
}
