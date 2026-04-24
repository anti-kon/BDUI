# Expression Language (`@bdui/expr`)

BDUI expressions are written inside `{{ … }}` and look intentionally similar
to JavaScript. Under the hood they are tokenised, parsed into an AST, and
interpreted with a strict allow-list — no `new Function`, no `eval`.

## Evaluation modes

- `evalExpression(source, state)` — compile + run once.
- `compile(source)` — produces a memoised `{ evaluate(state) }` handle.
- `evalExprRef(ref, state)` — evaluates an `ExprRef` directly.
- `interpolate(template, state)` — resolves every `{{ … }}` inside a string.
- `resolveValue(value, state)` — returns the string unchanged if it has no
  placeholders, otherwise delegates to `interpolate`.

## Grammar (informal)

```
Expression   = Ternary
Ternary      = Or ('?' Expression ':' Expression)?
Or           = And ('||' And)*
And          = Equality ('&&' Equality)*
Equality     = Comparison (('==' | '!=') Comparison)*
Comparison   = Additive (('<' | '<=' | '>' | '>=') Additive)*
Additive     = Multiplicative (('+' | '-') Multiplicative)*
Multiplicative = Unary (('*' | '/' | '%') Unary)*
Unary        = ('!' | '-') Unary | Postfix
Postfix      = Primary ( MemberAccess | Index | Call )*
Primary      = Number | String | Boolean | Null | Identifier | '(' Expression ')'
```

## Allowed identifiers

- Top-level: `flow`, `session`, `local`, `params` — standard state scopes.
- Inside those scopes: any user-defined path (`flow.counter`, `session.user.id`).
- Forbidden: `globalThis`, `window`, `process`, `eval`, `Function`, …
  (see `FORBIDDEN_IDENTIFIERS`).

## Built-in functions

Pure, side-effect-free functions defined in `packages/expr/src/builtins.ts`:

| Function                           | Example                              | Notes                          |
| ---------------------------------- | ------------------------------------ | ------------------------------ |
| `len(x)`                           | `len("abc") == 3`                    | length of string/array/object  |
| `has(obj, key)`                    | `has(flow.data, "id")`               | own-property check             |
| `includes(h, n)`                   | `includes(flow.tags, "new")`         | array or substring             |
| `min`, `max`                       | `min(flow.a, flow.b, 0)`             | variadic                       |
| `abs` / `round` / `floor` / `ceil` |                                      | numeric helpers                |
| `lower`, `upper`, `trim`           |                                      | string helpers                 |
| `coalesce(...)`                    | `coalesce(flow.x, 0)`                | first non-null argument        |
| `not(x)`                           | `not(flow.enabled)`                  | logical negation               |
| `isEmpty(x)`                       | `isEmpty(flow.items)`                | empty string/array/object/null |
| `concat(...)`                      | `concat(flow.first, " ", flow.last)` | string concatenation           |

## Limits and safety

Each compilation is bounded by `DEFAULT_LIMITS`:

- Maximum AST depth.
- Maximum number of nodes.
- Maximum expression length.

Violations throw `ExpressionError` at parse time, preventing pathological
inputs from causing catastrophic backtracking.

## Errors

Anything that fails to parse, references a forbidden identifier, or calls an
unknown function throws `ExpressionError`. Consumers like `ActionRunner` and
`resolveFlowStep` catch these to avoid crashing the renderer.
