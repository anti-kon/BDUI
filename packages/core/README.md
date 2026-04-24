# @bdui/core

Foundation types for BDUI — the Backend-Driven UI stack.

This package contains the strongly-typed building blocks used by every other
package in the monorepo:

- `Contract`, `Meta`, `Navigation`, `AppRoute`, `RouteScreen`, `FlowRouteScreen`.
- `Node` / `BDUIElement` base types.
- `Action` discriminated union (Server Action Language).
- `Expression<T>`, `ExprRef`, `StateTarget`, `Scope`, `Binding`.
- `ExpressionError` and a few small helpers (`exprRef`, `encodeExpr`,
  `isExprRef`, `isFlowRoute`, `isScreenRoute`).

No runtime logic lives here — just types and side-effect-free helpers. This
package is safe to import from both the browser and the server.

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
