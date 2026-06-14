# @bdui/core

Foundation types for BDUI - the Backend-Driven UI stack.

This package contains the strongly typed building blocks used by every other
package in the monorepo:

- `Contract`, `Meta`, `Navigation`, `AppRoute`, `RouteScreen`,
  `FlowRouteScreen`.
- `Node` / `BDUIElement` base types.
- `Modifiers` / `PlatformModifiers` for shared layout, typography, color and
  platform-neutral customization hints.
- `Action` discriminated union (Server Action Language).
- `Expression<T>`, `ExprRef`, `StateTarget`, `Scope`, `Binding`.
- `ExpressionError` and a few small helpers (`exprRef`, `encodeExpr`,
  `isExprRef`, `isFlowRoute`, `isScreenRoute`).

No runtime logic lives here - just types and side-effect-free helpers. This
package is safe to import from both the browser and the server.

## Component Customization

Every node can carry a `modifiers` object. BDUI keeps this bag open-ended, but
`PlatformModifiers` documents the keys that renderers should understand across
platforms where possible:

- layout: `padding`, `margin`, `gap`, `width`, `minHeight`, `align`,
  `justify`, `flexWrap`;
- surface: `background`, `color`, `border`, `borderRadius`, `boxShadow`,
  `opacity`;
- typography: `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`,
  `textAlign`;
- semantics: `role`, `variant`, `testId`, `accessibilityLabel`;
- web escape hatch: nested `style` plus additional camelCase CSS keys.

Native renderers may ignore web-only CSS details, but the contract shape stays
portable and does not require host applications to fork components just to tune
spacing, color or typography.

## Installation

```bash
npm install @bdui/core
```

## Exports

```ts
import {
  type Contract,
  type Action,
  type Expression,
  type ExprRef,
  exprRef,
  isExprRef,
} from '@bdui/core';
```
