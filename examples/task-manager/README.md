# Taskly Operations

Taskly Operations is the production-style BDUI showcase app. It is intentionally
kept as a standalone npm project so it demonstrates how an external product
would consume the public `@bdui/*` packages.

## What It Demonstrates

| Area              | BDUI capability shown                                                      |
| ----------------- | -------------------------------------------------------------------------- |
| Contract delivery | `createContractLoader` with stale-while-revalidate cache and ETag support  |
| Data loading      | Contract-level `dataSources` plus `fetch` actions for REST and static data |
| Server effects    | `call` actions with rollback handlers and atomic `batch` composition       |
| State             | `Flow` state for screen data and `Session` state persisted through storage |
| Forms             | A three-step `FlowRoute` with `flow.goTo`, `flow.complete`, `flow.abort`   |
| Validation        | Pluggable renderer validators invoked by the `validate` action             |
| Overlays          | Contract-defined modal descriptor opened and closed through SAL            |
| UX feedback       | `toast`, guarded `when` branches, status lines and route navigation        |
| Customization     | Platform modifiers plus `modifiers.style` web escape hatches               |

## Project Layout

```text
examples/task-manager/
  package.json
  tsconfig.json
  tsconfig.server.json
  public/
    brand-mark.svg
    index.html
    contract.json      # generated
    client.js          # generated
  src/
    app.tsx            # full BDUI contract source
    client.ts          # contract cache + mount bootstrap
    meta.json
  server/
    index.ts           # Fastify static server + mock API
```

## Requirements

- Node.js 22 or newer.
- The BDUI workspace built from the repository root:

```bash
npm install
npm run build:full
```

## Build

```bash
cd examples/task-manager
npm install
npm run build
```

The build runs:

```bash
npm run build:contract
npm run build:client
npm run build:server
```

## Run

```bash
npm start
```

Open `http://localhost:4000`.

Recommended demo path:

1. Open the dashboard and press **Refresh data source**. This fetches
   `/api/workspace` through the contract-level `workspaceSnapshot` data source.
2. Press **Load static catalog**. This uses the static `starterCatalog` data
   source without any network request.
3. Save a task. The app sends a `call` to `/api/task`, clears the draft and
   updates counters in an atomic batch.
4. Open **New request**. Complete the three-step flow and submit it to
   `/api/request`.
5. Open **Settings**. Change profile/session values and press **Save settings**
   to persist session state and sync with the server.
6. Reload the page. The cache badge shows whether the contract came from
   `network`, `cache` or `stale`.

## API Endpoints

| Endpoint                      | Purpose                                     |
| ----------------------------- | ------------------------------------------- |
| `GET /healthz`                | Server liveness check                       |
| `GET /api/workspace?plan=...` | Workspace snapshot for the REST data source |
| `POST /api/profile`           | Profile sync                                |
| `POST /api/task`              | Task capture                                |
| `POST /api/settings`          | Settings sync                               |
| `POST /api/request`           | Multi-step request submission               |

## Scripts

| Script                   | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `npm run build`          | Build contract, client bundle and server          |
| `npm start`              | Start the prebuilt Fastify server                 |
| `npm run dev`            | Build and start in one command                    |
| `npm run typecheck`      | Typecheck client, DSL and server sources          |
| `npm run build:contract` | Compile `src/app.tsx` into `public/contract.json` |
| `npm run build:client`   | Bundle `src/client.ts` into `public/client.js`    |
| `npm run build:server`   | Compile the Fastify server                        |

## Published Package Usage

When the BDUI packages are published, replace the local `file:` dependencies in
`package.json` with semver ranges such as `^0.6.0`. The application source does
not need to change.
