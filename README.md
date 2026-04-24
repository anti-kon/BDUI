# BDUI — Backend-Driven UI Stack

BDUI is an open cross-platform SDUI framework. Authors write UI in TSX using
a strongly-typed DSL, the transpiler turns it into a canonical JSON contract,
and renderer plugins display the same contract on web, Android Compose, and
iOS SwiftUI prototypes.

## Packages

| Package              | Description                                                      |
| -------------------- | ---------------------------------------------------------------- |
| `@bdui/core`         | Types, `Action` union, `Expression<T>`, navigation primitives    |
| `@bdui/expr`         | Safe expression language (lexer/parser/interpreter)              |
| `@bdui/defs`         | Component manifests + renderer extension points                  |
| `@bdui/schema`       | Strict JSON Schema generator + Ajv 2020 validator                |
| `@bdui/dsl`          | TSX DSL, builders, SAL shorthands, state handles                 |
| `@bdui/transpiler`   | TSX → canonical JSON contract (esbuild + source maps)            |
| `@bdui/runtime`      | Platform-agnostic runtime (state/nav/actions/flow/loader)        |
| `@bdui/renderer-web` | DOM renderer plugin                                              |
| `@bdui/registry`     | Fastify-based contract registry (pluggable storage, SemVer/auth) |
| `@bdui/sdk`          | `RegistryClient` + Fastify/Express adapters                      |
| `@bdui/cli`          | `bdui build`, `watch`, `gen`, `validate`, `registry`             |

## Quickstart

```bash
npm install
npm run build:full

# Author a contract in TSX, compile it, and render it:
npm run bdui -- build sandbox/counter/src/entry.tsx -o sandbox/counter/contract.json --mode dev

# Or run the registry server:
npm run bdui -- registry --port 4000 --data-dir ./data
```

See [`docs/getting-started.md`](docs/getting-started.md) for a walkthrough,
[`docs/architecture.md`](docs/architecture.md) for the big picture, and
[`CONTRIBUTING.md`](CONTRIBUTING.md) for local development tips.

## Highlights

- **No `new Function` ever** — expressions run through a strict mini-language.
- **Deterministic JSON** — stable keys/ordering and stripped `undefined`s make
  contract hashes reproducible.
- **One source of truth** — the JSON Schema is generated from TypeScript, so
  adding an action or component is a single-file change.
- **Pluggable storage and HTTP** — both client-side and registry-side.
- **RendererPlugin** — renderers only need to care about drawing; state,
  navigation, flows, toasts and HTTP live in `@bdui/runtime`.

## Sandbox examples

- `sandbox/counter` — minimal counter with `inc`/`dec`/`set`.
- `sandbox/state` — the four scopes (`flow`, `session`, `local`) in action.
- `sandbox/flow` — multi-step flow with `FlowRoute`/`Step` and guards.
- `sandbox/full-app` — full showcase: `Input`, `Select`, `Checkbox`, `Divider`,
  `If`, `when`, `batch` + `atomic`, `call` with `rollback`.

## Standalone applications

- [`examples/task-manager`](examples/task-manager) — Taskly, a full standalone
  BDUI app (TSX contract + Fastify server + browser bundle) that installs the
  `@bdui/*` packages as regular dependencies. Use it as a template for your
  own projects.
- [`examples/ops-control`](examples/ops-control) - Кампус, a Russian
  production-like student mobile cabinet rendered by the native Android Compose
  and iOS SwiftUI prototypes in [`native/`](native).

## Native renderers

- [`native/android`](native/android) - Jetpack Compose renderer prototype.
- [`native/ios`](native/ios) - SwiftUI renderer prototype.
- [`docs/native-renderers.md`](docs/native-renderers.md) - shared contract and
  renderer notes.

## Scripts

- `npm test` — 120+ vitest cases across the workspace.
- `npm run typecheck` — strict TypeScript check.
- `npm run lint` / `npm run format` — ESLint and Prettier.
- `npm run gen` — regenerate schema and DSL glue.
- `npm run build` — full workspace build.
- `npm run build:contracts` — rebuild tracked sandbox/example/native contract
  artifacts from TSX sources.
- `npm run test:coverage` — enforce the repository coverage gate.
- `npm run audit:all` — run dependency audits for the workspace and standalone
  Taskly example.
- `npm run verify:generated-contracts` — ensure tracked contracts match their
  TSX sources.
- `npm run verify:examples` — typecheck and bundle the standalone Taskly app.
- `npm run verify:contracts` — validate example/native contracts and ensure
  shared copies stay synchronized.
- `npm run verify:browser` — run a real-browser smoke of `sandbox/web-demo`
  with Playwright (`BDUI_BROWSER=chromium|firefox|webkit`).
- `npm run verify:browsers` — run the same smoke sequentially in Chromium,
  Firefox and WebKit.
- `npm run verify:native` — ensure the native prototypes cover every component
  and action used by the Campus contract.
- `npm run verify:web-demo` — rebuild vendored web-demo packages and fail if
  tracked demo artifacts are stale.
- `npm run verify:all` — run the full local acceptance suite.
- `npm run changeset` — author a changeset that CI will publish.

## Release process

Each package publishable change lives in a changeset under `.changeset/`.
`.github/workflows/ci.yml` runs lint, typecheck, build, and tests on every
push, and, on `main`, opens a "Version packages" PR via
[changesets/action](https://github.com/changesets/action). Merging that PR
publishes the new versions to npm.

## License

Released under the Apache 2.0 license (see `LICENSE`).
