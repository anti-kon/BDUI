# @bdui/expr

Safe expression language used by BDUI contracts. Replaces the previous
`new Function(...)` evaluator with a lexer/parser/AST-interpreter pipeline.

## Features

- Allow-list of identifiers (`flow`, `session`, `local`, `params`) and built-ins.
- Strict size/depth limits to prevent DoS via pathological inputs.
- Compilation cache — repeated evaluation of the same expression is O(1).
- Friendly `ExpressionError` messages for authoring-time diagnostics.

## API

```ts
import { compile, evalExpression, evalExprRef, interpolate, resolveValue } from '@bdui/expr';

compile('flow.x + 1');
evalExpression('len("abc")', {}); // 3
interpolate('Hi {{session.name}}!', { session: { name: 'Ann' } });
```

See [`docs/expr.md`](../../docs/expr.md) for the full grammar and built-ins
reference.
