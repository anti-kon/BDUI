import type { FastifyPluginAsync } from 'fastify';

import type { RegistryClient } from './client.js';

export interface FastifyBduiPluginOptions {
  readonly client: RegistryClient;
  readonly prefix?: string;
  readonly compatFrom?: string;
}

/**
 * Registers `GET <prefix>/resolve/:contractId` that proxies resolve requests
 * to the registry client.
 */
export const fastifyBduiPlugin: FastifyPluginAsync<FastifyBduiPluginOptions> = async (
  app,
  opts,
) => {
  const prefix = opts.prefix ?? '/bdui';
  app.get(`${prefix}/resolve/:contractId`, async (req, rep) => {
    const { contractId } = req.params as { contractId: string };
    const query = req.query as {
      version?: string;
      compatFrom?: string;
      routeId?: string;
      currentStepId?: string;
      state?: string;
    };
    const result = await opts.client.resolve({
      contractId,
      version: query.version,
      compatFrom: query.compatFrom ?? opts.compatFrom,
      routeId: query.routeId,
      currentStepId: query.currentStepId,
      state: query.state ? JSON.parse(query.state) : undefined,
      ifNoneMatch: req.headers['if-none-match'] as string | undefined,
    });
    if (result.notModified) {
      if (result.etag) rep.header('etag', result.etag);
      return rep.code(304).send();
    }
    if (result.etag) rep.header('etag', result.etag);
    rep.header('content-type', 'application/json; charset=utf-8');
    return {
      contractId: result.contractId,
      version: result.version,
      contract: result.contract,
      resolved: result.resolved,
    };
  });
};
