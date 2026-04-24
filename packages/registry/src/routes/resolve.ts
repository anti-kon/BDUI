import type { RuntimeStateLike } from '@bdui/core';
import type { FastifyInstance, FastifyRequest } from 'fastify';

import { RegistryError } from '../errors.js';
import { matchesEtag } from '../etag.js';
import { resolveRouteNode } from '../resolve.js';
import type { ContractStore } from '../store.js';

export interface ResolveRoutesOptions {
  readonly store: ContractStore;
}

type ResolveQuery = {
  id?: string;
  contractId?: string;
  version?: string;
  compatFrom?: string;
  routeId?: string;
  currentStepId?: string;
  state?: string;
};

type ResolveBody = {
  id?: string;
  contractId?: string;
  version?: string;
  compatFrom?: string;
  routeId?: string;
  currentStepId?: string;
  state?: RuntimeStateLike;
};

function parseJsonState(raw: string | undefined): RuntimeStateLike | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as RuntimeStateLike;
    throw new RegistryError('BAD_REQUEST', 'state query parameter must be an object');
  } catch (error) {
    if (error instanceof RegistryError) throw error;
    throw new RegistryError('BAD_REQUEST', 'failed to parse state query parameter as JSON');
  }
}

export default async function resolveRoutes(app: FastifyInstance, options: ResolveRoutesOptions) {
  const { store } = options;

  app.get('/v1/resolve', async (req: FastifyRequest<{ Querystring: ResolveQuery }>, rep) => {
    const q = req.query;
    const id = q.id ?? q.contractId;
    if (!id) {
      throw new RegistryError('BAD_REQUEST', 'query parameter "id" (or "contractId") is required');
    }
    const stored = q.version
      ? await store.getVersion(id, q.version)
      : await store.resolveVersion(id, undefined, q.compatFrom);
    const state = parseJsonState(q.state);
    const body = q.routeId
      ? { resolved: resolveRouteNode(stored.contract, q.routeId, state, q.currentStepId) }
      : { contract: stored.contract };
    const payload = {
      contractId: stored.contractId,
      version: stored.version,
      etag: stored.etag,
      ...body,
    };
    const ifNoneMatch = req.headers['if-none-match'];
    if (!q.routeId && matchesEtag(ifNoneMatch as string | undefined, stored.etag)) {
      rep.header('ETag', stored.etag);
      return rep.code(304).send();
    }
    rep.header('ETag', stored.etag);
    rep.header('Cache-Control', 'public, max-age=0, must-revalidate');
    return payload;
  });

  app.post('/v1/resolve', async (req: FastifyRequest<{ Body: ResolveBody }>, rep) => {
    const body = req.body ?? {};
    const id = body.id ?? body.contractId;
    if (!id) {
      throw new RegistryError('BAD_REQUEST', 'contractId is required');
    }
    const stored = body.version
      ? await store.getVersion(id, body.version)
      : await store.resolveVersion(id, undefined, body.compatFrom);
    const payload: Record<string, unknown> = {
      contractId: stored.contractId,
      version: stored.version,
      etag: stored.etag,
    };
    if (body.routeId) {
      payload.resolved = resolveRouteNode(
        stored.contract,
        body.routeId,
        body.state,
        body.currentStepId,
      );
    } else {
      payload.contract = stored.contract;
    }
    rep.header('ETag', stored.etag);
    return payload;
  });
}
