# @bdui/dsl

TSX authoring DSL for BDUI contracts. Produces JSON trees compatible with
`@bdui/core` out of the box — no React, no VDOM.

## What you get

- A JSX runtime that outputs plain contract nodes (`jsx`, `jsxs`, `Fragment`).
- Builders: `App`, `Screen`, `FlowScreen`, `Step`, `Route`, `Theme`.
- Action shorthands normalised to the canonical SAL:
  `set`, `inc`, `dec`, `toggle`, `append`, `merge`, `batch`, `when`,
  `flowStart/advance/goTo/…`, `call`, `toast`, `modalOpen/Close`, etc.
- State handles: `Flow<T>('name', default)`, `Session<T>('name', default)`,
  `Local<T>('name')`; pair them with `bind(v)` and `use(v)`.
- `StateCollector` captures initial state declared in TSX so it lands in
  `initial.flow` / `initial.session` of the output contract.
- `Expr` helper (`E`) for authoring expressions without string juggling.

See [`docs/getting-started.md`](../../docs/getting-started.md) for examples.
