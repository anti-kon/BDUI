# Registry HTTP API

The `@bdui/registry` package exposes a small Fastify-based HTTP API for
publishing, resolving, and listing BDUI contracts. The same API is reachable
through the `@bdui/sdk` `RegistryClient`.

## Conventions

- All endpoints speak `application/json`.
- Responses include an `ETag` header for cache-friendly clients.
- `If-None-Match` is supported; matching requests return `304` with no body.
- Errors follow the shape `{ "error": { "code", "message", "details? } }`.
- Supported error codes: `BAD_REQUEST` (400), `UNAUTHORIZED` (401), `NOT_FOUND` (404),
  `CONFLICT` (409), `VALIDATION_FAILED` (422), `INTERNAL` (500).
- CORS is disabled by default. Enable it explicitly through
  `createRegistryServer({ cors: { origin: "https://app.example" } })` or the CLI
  `--cors-origin` option.
- Bearer-token authentication can be enabled through
  `createRegistryServer({ auth: { token } })`, the CLI `--auth-token` option, or
  `BDUI_REGISTRY_TOKEN`.

## OpenAPI (condensed)

```yaml
openapi: 3.0.3
info:
  title: BDUI Registry
  version: 0.6.0-alpha.0
servers:
  - url: http://localhost:4000

paths:
  /v1/health:
    get:
      summary: Health probe
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                required: [ok, name]

  /v1/contracts:
    get:
      summary: List contract ids
      responses:
        '200': { description: OK }
    post:
      summary: Publish a new contract version
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [contract]
              properties:
                contract: { $ref: '#/components/schemas/Contract' }
                tags:
                  type: array
                  items: { type: string }
                compatFrom: { type: string }
      responses:
        '201':
          description: Created
          headers:
            ETag: { schema: { type: string } }
        '400': { description: Bad request }
        '409': { description: Version already exists }
        '422': { description: Validation failed }

  /v1/contracts/{id}:
    get:
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
        - in: query
          name: version
          schema: { type: string }
        - in: query
          name: compatFrom
          schema: { type: string }
      responses:
        '200': { description: OK }
        '304': { description: Not Modified }
        '404': { description: Not Found }

  /v1/contracts/{id}/{version}:
    get:
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
        - in: path
          name: version
          required: true
          schema: { type: string }
      responses:
        '200':
          description: OK
          headers:
            Cache-Control:
              { schema: { type: string, example: 'public, immutable, max-age=31536000' } }
            ETag: { schema: { type: string } }
        '304': { description: Not Modified }
        '404': { description: Not Found }

  /v1/versions:
    get:
      parameters:
        - in: query
          name: id
          required: true
          schema: { type: string }
      responses:
        '200': { description: OK }
        '400': { description: Missing id }

  /v1/resolve:
    get:
      description: Resolves a contract (and optionally a specific route) to a
        canonical node tree, honouring SemVer and compatFrom.
      parameters:
        - in: query
          name: id
          required: true
          schema: { type: string }
        - in: query
          name: version
          schema: { type: string }
        - in: query
          name: compatFrom
          schema: { type: string }
        - in: query
          name: routeId
          schema: { type: string }
        - in: query
          name: currentStepId
          schema: { type: string }
        - in: query
          name: state
          description: URL-encoded JSON describing `{ flow, session, local, params }`.
          schema: { type: string }
      responses:
        '200': { description: OK }
        '304': { description: Not Modified }
        '400': { description: Bad request }
        '404': { description: Not Found }
    post:
      description: Same as GET but accepts a JSON body instead of query params.

components:
  schemas:
    Contract:
      type: object
      required: [meta, navigation]
```

## SemVer behaviour

- When `version` is omitted, the latest published version is returned.
- When `compatFrom` is provided, the registry picks the newest version whose
  major matches `compatFrom.major` and whose SemVer is `>=` `compatFrom`.
- When no candidate satisfies `compatFrom`, `404` is returned.

## Storage adapters

- `MemoryStorageAdapter` — keeps contracts in memory; ideal for tests and dev.
- `FileSystemStorageAdapter` — persists each version to
  `<rootDir>/<contractId>/<version>.json` with a sidecar `.meta.json`.
- Custom adapters implement the `StorageAdapter` interface and can be passed
  into `createRegistryServer({ storage })`.

## Security configuration

```ts
const { app } = await createRegistryServer({
  storage,
  validate: true,
  auth: { token: process.env.BDUI_REGISTRY_TOKEN! },
  cors: { origin: 'https://admin.example' },
});
```

When authentication is enabled, `/v1/health` remains public by default for
probes. Pass `auth: { token, allowHealth: false }` to protect it as well.
