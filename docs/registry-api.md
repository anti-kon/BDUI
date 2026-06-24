# HTTP API реестра

Пакет `@bdui/registry` предоставляет небольшой Fastify-based HTTP API для
публикации, разрешения и просмотра BDUI-контрактов. Тот же API доступен через
`RegistryClient` из `@bdui/sdk`.

## Соглашения

- Все endpoints используют `application/json`.
- Ответы включают заголовок `ETag` для клиентского кеширования.
- Поддерживается `If-None-Match`; при совпадении сервер возвращает `304` без
  тела ответа.
- Ошибки имеют форму `{ "error": { "code", "message", "details? } }`.
- Поддерживаемые коды ошибок: `BAD_REQUEST` (400), `UNAUTHORIZED` (401),
  `NOT_FOUND` (404), `CONFLICT` (409), `VALIDATION_FAILED` (422),
  `INTERNAL` (500).
- CORS по умолчанию отключен. Его необходимо включать явно через
  `createRegistryServer({ cors: { origin: "https://app.example" } })` или CLI
  опцию `--cors-origin`.
- Bearer-token authentication включается через
  `createRegistryServer({ auth: { token } })`, CLI опцию `--auth-token` или
  переменную окружения `BDUI_REGISTRY_TOKEN`.

## OpenAPI

```yaml
openapi: 3.0.3
info:
  title: BDUI Registry
  version: 1.0.0
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

## Поведение SemVer

- Если `version` не указан, возвращается последняя опубликованная версия.
- Если указан `compatFrom`, реестр выбирает самую новую версию с тем же major,
  что и `compatFrom.major`, и SemVer `>= compatFrom`.
- Если подходящая версия не найдена, возвращается `404`.

## Адаптеры хранения

- `MemoryStorageAdapter` - хранит контракты в памяти; подходит для тестов и
  разработки.
- `FileSystemStorageAdapter` - сохраняет каждую версию в
  `<rootDir>/<contractId>/<version>.json` и sidecar-файл `.meta.json`.
- Пользовательские адаптеры реализуют интерфейс `StorageAdapter` и передаются в
  `createRegistryServer({ storage })`.

## Конфигурация безопасности

```ts
const { app } = await createRegistryServer({
  storage,
  validate: true,
  auth: { token: process.env.BDUI_REGISTRY_TOKEN! },
  cors: { origin: 'https://admin.example' },
});
```

При включенной авторизации `/v1/health` по умолчанию остается публичным для
health checks. Для закрытия этого endpoint необходимо передать
`auth: { token, allowHealth: false }`.
