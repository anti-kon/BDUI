# Native BDUI renderers

This directory contains native renderer prototypes that consume the same
canonical BDUI JSON contract:

- `android/` - Jetpack Compose renderer with Campus and Luma Market flavors.
- `ios/` - SwiftUI renderer and Campus app shell.

Both implementations target the practical minimum needed for a real mobile
BDUI application:

- route selection from `navigation.routes`;
- `flow`, `session` and `local` state scopes;
- interpolation of `{{scope.path}}` expressions;
- conditional rendering through `If`;
- portable `Image` fallback rendering for contract-provided marks and bundled
  PNG product assets in the Android renderer;
- two-way bindings for `Input`, `Checkbox` and `Select`;
- portable `modifiers` for spacing, padding, wrapping rows, text roles, colors
  and button variants;
- core SAL actions: `navigate`, `back`, `set`, `reset`, `update.inc`,
  `update.toggle`, `batch`, `when`, `toast`, `flow.start`, `flow.goTo`,
  `flow.complete` and `flow.abort`.

The shared Campus and Luma Market contracts are generated from
`examples/ops-control/src/app.tsx` and `examples/retail-commerce/src/app.tsx`,
then copied into native app resource folders by `npm.cmd run build:contracts`.
