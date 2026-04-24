# @bdui/registry

Fastify-based HTTP registry for BDUI contracts. Pluggable storage, SemVer +
`compatFrom` resolution, proper ETag / `If-None-Match` handling.

## Start the server

```bash
npx bdui registry --port 4000 --data-dir ./data
```

Or programmatically:

```ts
import { createRegistryServer, createFileSystemStorage } from '@bdui/registry';

const server = await createRegistryServer({
  storage: createFileSystemStorage({ rootDir: './data' }),
});
await server.app.listen({ port: 4000, host: '0.0.0.0' });
```

## Endpoints

- `GET /v1/health`
- `GET /v1/contracts`
- `POST /v1/contracts`
- `GET /v1/contracts/:id?version=&compatFrom=`
- `GET /v1/contracts/:id/:version`
- `GET /v1/versions?id=…`
- `GET /v1/resolve?id=&version=&compatFrom=&routeId=&currentStepId=&state=`
- `POST /v1/resolve`

See [`docs/registry-api.md`](../../docs/registry-api.md) for the full spec.

## Storage adapters

- `MemoryStorageAdapter` for tests and development.
- `FileSystemStorageAdapter` for durable storage.
- Custom adapters implement the `StorageAdapter` interface.
