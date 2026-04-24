# Taskly

A complete, standalone BDUI application used as an end-to-end smoke test of the
public `@bdui/*` APIs. The repository itself is a normal npm project: the BDUI
stack is installed as regular dependencies via `file:` references. Once the
packages are published to npm you can drop-in replace those `file:` links with
`^0.6.0` (or whatever version you consume) without touching any other code.

## What the app demonstrates

| Route                    | Highlights                                                                |
| ------------------------ | ------------------------------------------------------------------------- |
| `login`                  | `Input`, conditional `If`, guarded `when`/`navigate` actions              |
| `onboarding` (FlowRoute) | `Step` composition, `flow.goTo`/`flow.complete`/`flow.abort`, `toast`     |
| `dashboard`              | `batch` + `atomic: true`, `call` with `rollback`, persistence via `Flow`  |
| `settings`               | `Select`, `Checkbox`, server `call` with rollback and session persistence |

The TSX contract at `src/app.tsx` is compiled to `public/contract.json` by the
BDUI CLI. A thin esbuild bundle (`src/client.ts` → `public/client.js`) loads
the contract and mounts `@bdui/renderer-web`. A Fastify server serves the
static `public/` directory together with three mock REST endpoints
(`/api/profile`, `/api/task`, `/api/settings`) used by the `call` actions.

## Project layout

```
examples/task-manager/
├── package.json
├── tsconfig.json          # client/DSL
├── tsconfig.server.json   # server (NodeNext)
├── public/
│   ├── index.html
│   ├── contract.json      # generated
│   └── client.js          # generated
├── src/
│   ├── app.tsx            # entire app UI in TSX
│   ├── client.ts          # browser bootstrap
│   └── meta.json
└── server/
    └── index.ts           # Fastify + static + API
```

## Requirements

- Node.js ≥ 22
- The BDUI workspace built in the repository root (`npm install && npm run build:full` in `c:\Coding\BDUI`).

## Install & build

```bash
cd examples/task-manager
npm install
npm run build         # builds contract, client, server
```

Individual steps:

```bash
npm run build:contract   # bdui build src/app.tsx -> public/contract.json
npm run build:client     # esbuild src/client.ts -> public/client.js
npm run build:server     # tsc -> dist/server/index.js
```

## Run

```bash
npm start
# Taskly is up on http://localhost:4000
```

Override the port with `PORT=4123 npm start`.

Open <http://localhost:4000> in a browser. You will walk through:

1. The **login** screen — fill name/email and press _Continue_.
2. The **onboarding** `FlowRoute` — three steps navigated by `flow.goTo`. The
   last step issues a `call` that hits `POST /api/profile` and then finishes
   the flow via `flow.complete`.
3. The **dashboard** — a task input. Submitting triggers an atomic batch:
   `call` saves to the server, `update.inc` bumps a counter, a success toast
   is shown. If the server call fails, the whole batch rolls back and an
   error message appears.
4. The **settings** screen — theme/notifications persisted to the session
   scope and synced to `POST /api/settings` with automatic rollback on
   failure.

## Scripts

| Script                   | Description                                        |
| ------------------------ | -------------------------------------------------- |
| `npm run build`          | Build the contract, client and server in one go.   |
| `npm start`              | Start the Fastify server (uses the prebuilt dist). |
| `npm run dev`            | `build` + `start` (useful during development).     |
| `npm run typecheck`      | `tsc --noEmit` over the whole project.             |
| `npm run build:contract` | Only rebuild `public/contract.json` from TSX.      |
| `npm run build:client`   | Only rebuild the browser bundle.                   |
| `npm run build:server`   | Only rebuild the server.                           |

## Using published packages

When `@bdui/*` is available on npm just replace the `file:` entries in
`package.json` with a semver range, e.g.

```json
"dependencies": {
  "@bdui/dsl": "^0.6.0",
  "@bdui/renderer-web": "^0.6.0",
  "@bdui/sdk": "^0.6.0"
}
```

Nothing else changes — the source code imports the same symbols either way.
