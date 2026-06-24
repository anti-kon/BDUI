# Taskly

Taskly is a production-style BDUI web application. It is kept as a standalone
npm project to show how an external product consumes the public `@bdui/*`
packages.

## Capabilities

| Area              | BDUI capability                                                        |
| ----------------- | ---------------------------------------------------------------------- |
| Contract delivery | `createContractLoader`, stale-while-revalidate cache and ETag          |
| Data loading      | Contract-level `dataSources`, REST sources and static sources          |
| Server effects    | `call` actions, rollback handlers and atomic `batch` execution         |
| State             | `Flow` screen state and persistent `Session` state                     |
| Forms             | Three-step `FlowRoute` with `flow.goTo`, `flow.complete`, `flow.abort` |
| Validation        | Renderer validators invoked through `validate`                         |
| Overlays          | Contract-defined modal descriptor opened and closed through SAL        |
| Feedback          | `toast`, guarded `when` branches, status rows and route navigation     |
| Customization     | Platform modifiers and a web escape hatch through `modifiers.style`    |

## Structure

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
    app.tsx            # BDUI contract source
    client.ts          # bootstrap, cache loader, mount
    meta.json
  server/
    index.ts           # Fastify static server and mock API
```

## Requirements

- Node.js 24 or newer.
- Built BDUI workspace from the repository root:

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

The build command compiles the contract, client bundle and server:

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

Suggested smoke scenario:

1. Open the dashboard and select **Refresh data**.
2. Select **Load catalog**.
3. Save a task to verify `call`, `batch` and state updates.
4. Open **New request**, change select values and complete the three-step form.
5. Open **Settings**, update profile, plan and theme values, then save.
6. Reload the page and check the contract source status: `network`, `cache` or
   `stale`.

## API Endpoints

| Endpoint                      | Purpose                       |
| ----------------------------- | ----------------------------- |
| `GET /healthz`                | Server health check           |
| `GET /api/workspace?plan=...` | Workspace snapshot            |
| `POST /api/profile`           | Profile synchronization       |
| `POST /api/task`              | Task persistence              |
| `POST /api/settings`          | Settings synchronization      |
| `POST /api/request`           | Multi-step request submission |

## Scripts

| Script                   | Description                                     |
| ------------------------ | ----------------------------------------------- |
| `npm run build`          | Build the contract, client bundle and server    |
| `npm start`              | Start the previously built server               |
| `npm run dev`            | Build and start in one command                  |
| `npm run typecheck`      | Type-check the client, DSL and server           |
| `npm run build:contract` | Compile `src/app.tsx` to `public/contract.json` |
| `npm run build:client`   | Compile `src/client.ts` to `public/client.js`   |
| `npm run build:server`   | Compile the Fastify server                      |

## Package Versions

The example currently uses local workspace package links. When the BDUI packages
are consumed from a registry, replace the local `file:` dependencies in
`package.json` with semver ranges such as `^1.0.0`. The application source does
not require changes.
