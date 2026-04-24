import cors from '@fastify/cors';
import etagPlugin from '@fastify/etag';
import Fastify, {
  type FastifyBaseLogger,
  type FastifyInstance,
  type FastifyServerOptions,
} from 'fastify';

import type { StorageAdapter } from './adapter.js';
import { createMemoryStorage } from './adapters/memory.js';
import { RegistryError, toErrorBody } from './errors.js';
import contractsRoutes from './routes/contracts.js';
import healthRoutes from './routes/health.js';
import resolveRoutes from './routes/resolve.js';
import { ContractStore } from './store.js';

export interface RegistryServerOptions {
  readonly storage?: StorageAdapter;
  readonly store?: ContractStore;
  readonly validate?: boolean;
  readonly logger?: FastifyBaseLogger | boolean;
  readonly cors?: Parameters<typeof cors>[1] | false;
  readonly auth?: { readonly token: string; readonly allowHealth?: boolean } | false;
  readonly fastifyOptions?: Omit<FastifyServerOptions, 'logger'>;
}

export interface RegistryServer {
  readonly app: FastifyInstance;
  readonly store: ContractStore;
  readonly storage: StorageAdapter;
}

export async function createRegistryServer(
  options: RegistryServerOptions = {},
): Promise<RegistryServer> {
  const storage = options.storage ?? createMemoryStorage();
  const store =
    options.store ??
    new ContractStore({
      storage,
      validate: options.validate,
    });

  const app = Fastify({
    ...options.fastifyOptions,
    logger: options.logger ?? false,
  });

  app.setErrorHandler((err, req, rep) => {
    const error = err as Error & { validation?: unknown };
    if (error instanceof RegistryError) {
      return rep.code(error.status).send(toErrorBody(error));
    }
    if (error.validation !== undefined) {
      return rep.code(400).send({
        error: { code: 'BAD_REQUEST', message: error.message },
      });
    }
    req.log?.error({ err: error }, 'registry error');
    return rep.code(500).send({
      error: { code: 'INTERNAL', message: 'internal server error' },
    });
  });

  if (options.auth && options.auth.token) {
    const expected = `Bearer ${options.auth.token}`;
    const allowHealth = options.auth.allowHealth !== false;
    app.addHook('onRequest', async (req, rep) => {
      if (allowHealth && req.url.startsWith('/v1/health')) return;
      if (req.headers.authorization === expected) return;
      return rep.code(401).send({
        error: { code: 'UNAUTHORIZED', message: 'authentication required' },
      });
    });
  }

  if (options.cors) {
    await app.register(cors, options.cors);
  }
  await app.register(etagPlugin);

  await healthRoutes(app);
  await contractsRoutes(app, { store });
  await resolveRoutes(app, { store });

  return { app, store, storage };
}
