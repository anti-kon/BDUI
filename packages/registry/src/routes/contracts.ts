import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { matchesEtag } from '../etag.js';
import type { ContractStore } from '../store.js';
import type { StoredContract } from '../types.js';

export interface ContractRoutesOptions {
  readonly store: ContractStore;
}

type PublishBody = { contract?: unknown; tags?: unknown; compatFrom?: unknown };

function writeStoredHeaders(rep: FastifyReply, stored: StoredContract): void {
  rep.header('ETag', stored.etag);
  rep.header('Content-Type', 'application/json; charset=utf-8');
  rep.header('X-Bdui-Contract-Id', stored.contractId);
  rep.header('X-Bdui-Contract-Version', stored.version);
  rep.header('Cache-Control', 'public, max-age=0, must-revalidate');
}

export default async function contractsRoutes(
  app: FastifyInstance,
  options: ContractRoutesOptions,
) {
  const { store } = options;

  app.post('/v1/contracts', async (req: FastifyRequest<{ Body: PublishBody }>, rep) => {
    const body = req.body ?? {};
    const saved = await store.publish({
      contract: body.contract as never,
      tags: Array.isArray(body.tags) ? (body.tags as string[]) : undefined,
      compatFrom: typeof body.compatFrom === 'string' ? body.compatFrom : undefined,
    });
    writeStoredHeaders(rep, saved);
    return rep.code(201).send({
      contractId: saved.contractId,
      version: saved.version,
      etag: saved.etag,
      createdAt: saved.createdAt,
      tags: saved.tags,
      compatFrom: saved.compatFrom,
    });
  });

  app.get(
    '/v1/contracts/:id',
    async (
      req: FastifyRequest<{
        Params: { id: string };
        Querystring: { version?: string; compatFrom?: string };
      }>,
      rep,
    ) => {
      const { id } = req.params;
      const { version, compatFrom } = req.query;
      const stored = version
        ? await store.getVersion(id, version)
        : await store.resolveVersion(id, undefined, compatFrom);
      const ifNoneMatch = req.headers['if-none-match'];
      if (matchesEtag(ifNoneMatch as string | undefined, stored.etag)) {
        rep.header('ETag', stored.etag);
        return rep.code(304).send();
      }
      writeStoredHeaders(rep, stored);
      return rep.send(stored.contract);
    },
  );

  app.get(
    '/v1/contracts/:id/:version',
    async (req: FastifyRequest<{ Params: { id: string; version: string } }>, rep) => {
      const { id, version } = req.params;
      const stored = await store.getVersion(id, version);
      const ifNoneMatch = req.headers['if-none-match'];
      if (matchesEtag(ifNoneMatch as string | undefined, stored.etag)) {
        rep.header('ETag', stored.etag);
        return rep.code(304).send();
      }
      writeStoredHeaders(rep, stored);
      rep.header('Cache-Control', 'public, immutable, max-age=31536000');
      return rep.send(stored.contract);
    },
  );

  app.get('/v1/contracts', async () => {
    return { items: await store.listContracts() };
  });

  app.get(
    '/v1/versions',
    async (req: FastifyRequest<{ Querystring: { id?: string; contractId?: string } }>, rep) => {
      const id = req.query.id ?? req.query.contractId;
      if (!id) {
        return rep.code(400).send({
          error: {
            code: 'BAD_REQUEST',
            message: 'query parameter "id" (or "contractId") is required',
          },
        });
      }
      const versions = await store.listVersions(id);
      return {
        contractId: id,
        items: versions.map((entry) => ({
          version: entry.version,
          etag: entry.etag,
          createdAt: entry.createdAt,
          tags: entry.tags,
          compatFrom: entry.compatFrom,
        })),
      };
    },
  );
}
