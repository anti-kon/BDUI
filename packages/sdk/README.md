# @bdui/sdk

Server integration SDK for BDUI.

## RegistryClient

Typed HTTP client for the BDUI registry.

```ts
import { RegistryClient } from '@bdui/sdk';

const client = new RegistryClient({ baseUrl: 'http://registry:4000' });

await client.publish({ contract });
const resolved = await client.resolve({ contractId: 'app', compatFrom: '1.0.0' });
const versions = await client.listVersions('app');
const details = await client.getContract('app', '1.2.3', etag);
```

All methods respect `If-None-Match` / `304` for cache-friendly integrations.

## Adapters

- `createExpressHandler` — minimal Express-style handler around
  `RegistryClient.resolve`.
- `fastifyBduiPlugin` — Fastify plugin exposing `GET <prefix>/resolve/:id`.

## Compile helper

```ts
import { compileContract } from '@bdui/sdk';

const { contract } = await compileContract({ entry: './app.tsx' });
await client.publish({ contract });
```

## Re-exports

`@bdui/sdk` also re-exports the registry core primitives (`ContractStore`,
`RegistryError`, storage adapters) so a single dependency is enough to embed
BDUI into an existing server.
