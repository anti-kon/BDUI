#!/usr/bin/env node
import path from 'node:path';

import { createFileSystemStorage } from './adapters/fs.js';
import { createMemoryStorage } from './adapters/memory.js';
import { createRegistryServer } from './server.js';

async function main() {
  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  const host = process.env.HOST ?? '0.0.0.0';
  const dataDir = process.env.BDUI_REGISTRY_DATA_DIR;
  const authToken = process.env.BDUI_REGISTRY_TOKEN;
  const corsOrigin = process.env.BDUI_REGISTRY_CORS_ORIGIN;

  const storage = dataDir
    ? createFileSystemStorage({ rootDir: path.resolve(dataDir) })
    : createMemoryStorage();

  const { app } = await createRegistryServer({
    storage,
    logger: true,
    auth: authToken ? { token: authToken } : false,
    cors: corsOrigin ? { origin: corsOrigin } : false,
  });

  await app.listen({ port, host });

  console.log(`[bdui/registry] listening on http://${host}:${port}`);
}

main().catch((error) => {
  console.error('[bdui/registry] fatal error', error);
  process.exit(1);
});
