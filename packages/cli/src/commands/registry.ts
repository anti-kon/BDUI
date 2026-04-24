import path from 'node:path';

import { createFileSystemStorage, createMemoryStorage, createRegistryServer } from '@bdui/registry';

export interface RunRegistryOptions {
  readonly port?: number;
  readonly host?: string;
  readonly dataDir?: string;
  readonly validate?: boolean;
  readonly authToken?: string;
  readonly corsOrigin?: string;
}

export async function runRegistry(options: RunRegistryOptions = {}): Promise<void> {
  const port = options.port ?? 4000;
  const host = options.host ?? '0.0.0.0';
  const storage = options.dataDir
    ? createFileSystemStorage({ rootDir: path.resolve(options.dataDir) })
    : createMemoryStorage();
  const server = await createRegistryServer({
    storage,
    validate: options.validate,
    logger: true,
    auth: options.authToken ? { token: options.authToken } : false,
    cors: options.corsOrigin ? { origin: options.corsOrigin } : false,
  });
  await server.app.listen({ port, host });
  const address = server.app.server.address();
  const actualPort = typeof address === 'object' && address ? address.port : port;

  console.log(`[bdui/registry] listening on http://${host}:${actualPort}`);
}
