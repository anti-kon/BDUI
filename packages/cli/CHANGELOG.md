# @bdui/cli

## 0.6.0

### Minor Changes

- 476259b: BDUI 0.6 production-readiness overhaul.

  Added new `@bdui/core`, `@bdui/expr`, `@bdui/runtime`, and `@bdui/sdk` packages.
  Rewrote `@bdui/registry` with pluggable `StorageAdapter` implementations,
  SemVer-aware resolution, ETag caching, and a typed HTTP client. Expanded the
  DSL/SAL surface (`flow.*`, `batch` with atomic rollback, `when`,
  `update.inc/dec/toggle/append/merge`, runtime-backed `fetch` and `validate`,
  full `Input`/`Select`/`Checkbox`/`If` components). Replaced unsafe expression
  evaluation with a safe AST-based mini language. Tightened the JSON Schema and
  introduced deterministic, source-map aware transpilation. Shipped registry
  bearer auth/CORS controls, Android Compose and iOS SwiftUI prototypes, docs,
  CLI subcommands, CI artifact checks, audit gates, and comprehensive tests.
