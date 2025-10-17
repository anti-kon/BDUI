import path from 'node:path';

import cors from '@fastify/cors';
import etag from '@fastify/etag';
import staticPlugin from '@fastify/static';
import Fastify from 'fastify';

import routes from './routes.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function main() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true });
  await app.register(etag);
  await app.register(staticPlugin, {
    root: path.resolve(process.cwd(), 'public'),
    prefix: '/public/',
  });

  await routes(app);

  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`[bdui/registry] listening on :${PORT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
