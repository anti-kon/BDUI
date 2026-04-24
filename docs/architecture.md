# BDUI Architecture

The project follows a layered monorepo design. Each layer only depends on
layers below it; cycles are explicitly forbidden.

```text
+----------------------------+  Web DOM plugin, Android Compose prototype,
| Renderers                  |  and iOS SwiftUI prototype
+----------------------------+
| @bdui/runtime              |  State, navigation, flow, actions, HTTP
+----------------------------+
| @bdui/transpiler           |  TSX to JSON via esbuild and Ajv
+----------------------------+
| @bdui/dsl  @bdui/schema    |  Author-time DSL and schema validator
+----------------------------+
| @bdui/defs @bdui/expr      |  Component manifests and safe expressions
+----------------------------+
| @bdui/core                 |  Contract types, action union, primitives
+----------------------------+
```

## Package roles

- **`@bdui/core`** - pure types and light helpers. No runtime side effects.
- **`@bdui/expr`** - lexer/parser/interpreter for the `{{...}}` mini-language.
  Replaces the legacy `new Function(...)` approach.
- **`@bdui/defs`** - component manifests (`Button`, `Input`, `If`, and others),
  DOM renderer implementations, renderer extension points, and the tree
  validator.
- **`@bdui/schema`** - compile-time JSON Schema generation and Ajv 2020
  validation.
- **`@bdui/dsl`** - TSX runtime, builders, action shorthands, and the
  `StateCollector` pattern for initial state.
- **`@bdui/transpiler`** - bundles an entry TSX module, validates the resulting
  object, and emits canonical deterministic JSON.
- **`@bdui/runtime`** - platform-agnostic runtime: state controller, event bus,
  navigation, flow resolver, action runner, validators, toast/modal hosts, HTTP
  client, data-source fetching, and stale-while-revalidate contract loading.
- **`@bdui/renderer-web`** - DOM plugin on top of `@bdui/runtime`. Owns
  rendering only; state and action logic stay in the runtime.
- **`@bdui/registry`** - Fastify-based registry server. Pluggable storage,
  SemVer-aware resolution, `If-None-Match`/`304`, optional bearer auth,
  explicit CORS configuration, and uniform JSON errors.
- **`@bdui/sdk`** - HTTP client plus Fastify/Express adapters for embedding BDUI
  into server applications.
- **`@bdui/cli`** - `bdui build`, `watch`, `gen`, `validate`, and `registry`.

## Key invariants

1. **No arbitrary code** in contracts - only typed SAL actions and mini-language
   expressions.
2. **Deterministic JSON** - the transpiler sorts object keys and strips
   `undefined` values so contract hashes are stable.
3. **Single source of truth** - JSON Schema is generated from TypeScript types.
   Adding an action or component requires changes in one authoritative place and
   regenerated artifacts.
4. **Renderer plugins** - everything except platform drawing lives in
   `@bdui/runtime`. Native renderers can consume the same contract and implement
   the required component/action subset with platform widgets.
5. **Verified artifacts** - generated schema, DSL glue, example contracts,
   native contract copies, and the vendored web demo are checked by repository
   scripts and CI.

## Data flow at runtime

```text
Contract JSON -> ContractLoader -> RuntimeState -> NavigationController
                      |                |                  |
                 StorageAdapter    ActionRunner      RendererPlugin
                                       |
                               HttpClient / validators
                                       |
                               EventBus -> Toast / Modal
```

Events flow through the bus. Renderers observe state/navigation changes and
translate the current route into DOM, Compose, SwiftUI, or another platform UI.
