# Native BDUI renderers

This directory contains native renderer prototypes that consume the same
canonical BDUI JSON contract:

- `android/` - Jetpack Compose renderer and Campus app shell.
- `ios/` - SwiftUI renderer and Campus app shell.

Both implementations target the practical minimum needed for a real mobile
BDUI application:

- route selection from `navigation.routes`;
- `flow`, `session` and `local` state scopes;
- interpolation of `{{scope.path}}` expressions;
- conditional rendering through `If`;
- portable `Image` fallback rendering for contract-provided marks;
- two-way bindings for `Input`, `Checkbox` and `Select`;
- portable `modifiers` for spacing, padding, text roles and button variants;
- core SAL actions: `navigate`, `back`, `set`, `reset`, `update.inc`,
  `update.toggle`, `batch`, `when`, `toast`, `flow.start`, `flow.goTo`,
  `flow.complete` and `flow.abort`.

The shared Campus contract is generated from
`examples/ops-control/src/app.tsx` into `examples/ops-control/contract.json` and
then copied into each native app resource folder.
