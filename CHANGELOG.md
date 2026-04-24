# Changelog

All notable changes to BDUI are tracked in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and adheres to [SemVer](https://semver.org/).

## Unreleased

### Added

- Runtime-backed `fetch` and `validate` SAL actions with data-source resolution,
  explicit `saveTo` support, validator hooks, and unit coverage.
- Optional bearer authentication and explicit CORS configuration for the
  registry server and CLI.
- Native Android Compose and iOS SwiftUI renderer prototypes backed by the
  shared `examples/ops-control` contract.
- Contract artifact and vendored web-demo verification scripts for CI.
- Coverage and dependency-audit gates for the main workspace and standalone
  Taskly example.

### Changed

- Generated schema/DSL TypeScript files are now formatted through local
  Prettier during generation.
- Dependency versions and lockfiles were refreshed to clear moderate-or-higher
  audit findings.

## [0.6.0-alpha.0] - 2026-04-24

### Added

- `@bdui/core` package with strict types for every primitive (`Action`,
  `Contract`, `Node`, `Expression<T>`, navigation/flow structures) replacing
  the loose `@bdui/common`.
- `@bdui/expr` — safe expression language (lexer/parser/interpreter) with
  allow-list identifiers, built-ins, and size/depth limits.
- Full SAL coverage in `@bdui/dsl`: `batch`, `when`, `update.inc/dec/toggle/
append/merge`, `flow.*`, `StateVar` shorthands, `bind()`.
- `@bdui/defs` components: `Input`, `Checkbox`, `Select`, `Image`, `Divider`,
  `If`, with web renderers and a tree validator for nesting rules.
- Strict JSON Schema (`@bdui/schema`): `Action` and `ExprRef` generated from
  TypeScript, `additionalProperties: false`, `oneOf`-based `Node` union,
  `/$defs/` rebased references.
- Modular `@bdui/transpiler` with source maps, deterministic JSON output and
  artifact cleanup.
- New `@bdui/runtime` package: state, navigation, actions, flow, event bus,
  HTTP client, toast/modal controllers, contract loader with
  stale-while-revalidate caching.
- `@bdui/renderer-web` rewritten as a slim DOM plugin on top of the runtime.
- `@bdui/registry` rewritten around `StorageAdapter` (in-memory and
  file-system), SemVer + `compatFrom`, `If-None-Match/304`, uniform 4xx/5xx
  error bodies.
- `@bdui/sdk` package: `RegistryClient`, Fastify and Express adapters.
- `@bdui/cli` commands: `build`, `watch`, `gen`, `validate`, `registry`.
- Tests: 120+ vitest cases covering core, expr, schema, defs, dsl, runtime,
  transpiler, registry, renderer-web (integration), sdk.
- Documentation: `docs/getting-started.md`, `docs/architecture.md`,
  `docs/spec.md`, `docs/actions.md`, `docs/expr.md`, `docs/registry-api.md`.

### Changed

- Monorepo versions unified at `0.6.0-alpha.0`; removed the duplicated
  `.eslintrc.cjs`.
- Fastify upgraded to v5; `@fastify/etag` upgraded accordingly.
- `transpiler` no longer depends on `source-map`; uses raw source maps.

### Removed

- Legacy `@bdui/common` in favour of `@bdui/core`.
- `new Function(...)` expression evaluator.
- Legacy registry in-memory store (replaced by `ContractStore`).
