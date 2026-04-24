import type { IncomingMessage, ServerResponse } from 'node:http';

import type { RegistryClient, ResolveOptions } from './client.js';

export interface ExpressHandlerOptions {
  readonly client: RegistryClient;
  readonly resolveContractId: (req: IncomingMessage) => string | undefined;
  readonly resolveRouteId?: (req: IncomingMessage) => string | undefined;
  readonly compatFrom?: string;
}

type NextFn = (err?: unknown) => void;

/**
 * Minimal Express-style handler that resolves a BDUI contract from a registry
 * and forwards it as JSON. Useful for quick server integrations that don't
 * want to depend on Express types directly.
 */
export function createExpressHandler(options: ExpressHandlerOptions) {
  return async function bduiHandler(
    req: IncomingMessage,
    res: ServerResponse,
    next?: NextFn,
  ): Promise<void> {
    try {
      const contractId = options.resolveContractId(req);
      if (!contractId) {
        res.statusCode = 400;
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ error: { code: 'BAD_REQUEST', message: 'contractId missing' } }));
        return;
      }
      const resolveOptions: ResolveOptions = {
        contractId,
        routeId: options.resolveRouteId?.(req),
        compatFrom: options.compatFrom,
      };
      const ifNoneMatch = req.headers['if-none-match'];
      if (typeof ifNoneMatch === 'string') {
        (resolveOptions as { ifNoneMatch?: string }).ifNoneMatch = ifNoneMatch;
      }
      const result = await options.client.resolve(resolveOptions);
      if (result.notModified) {
        res.statusCode = 304;
        if (result.etag) res.setHeader('etag', result.etag);
        res.end();
        return;
      }
      if (result.etag) res.setHeader('etag', result.etag);
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          contractId: result.contractId,
          version: result.version,
          contract: result.contract,
          resolved: result.resolved,
        }),
      );
    } catch (error) {
      if (next) return next(error);
      res.statusCode = 500;
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ error: { code: 'INTERNAL', message: (error as Error).message } }));
    }
  };
}
