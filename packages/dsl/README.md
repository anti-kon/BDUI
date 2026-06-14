# @bdui/dsl

TSX authoring DSL for BDUI contracts. It produces plain JSON-compatible
contract objects and does not depend on React or a virtual DOM.

## What You Get

- JSX runtime that outputs contract nodes.
- Builders: `Contract`, `Navigation`, `Route`, `FlowRoute`, `Step`, `Theme`.
- Contract-level `dataSources` for runtime `fetch` actions.
- Generated component functions typed from `@bdui/defs` manifests, including
  `modifiers`, correct children models and short-action event inputs.
- Action shorthands normalized to canonical SAL: `set`, `inc`, `dec`,
  `toggle`, `append`, `merge`, `batch`, `when`, `call`, `fetch`, `validate`,
  `prefetch`, `toast`, `modalOpen`, `modalClose` and flow actions.
- State handles: `Flow<T>()`, `Session<T>()`, `Local<T>()`, plus `bind(v)` and
  `use(v)`.
- `StateCollector`, which captures TSX-declared initial state into
  `initial.flow` and `initial.session`.
- `E(...)` for typed expression references.

## Customization

Every generated component accepts shared `modifiers` from `@bdui/core`.
Common keys such as `padding`, `gap`, `background`, `color`, `borderRadius`,
`fontSize`, `fontWeight`, `align` and `justify` are platform-neutral hints.
Web renderers also accept nested `style` and additional camelCase CSS keys:

```tsx
<Column
  modifiers={{
    padding: 16,
    borderRadius: 12,
    background: '#ffffff',
    style: { gridTemplateColumns: '1fr auto' },
  }}
>
  <Text modifiers={{ fontSize: 18, fontWeight: 700 }}>Ready</Text>
</Column>
```

Event props accept both canonical SAL actions and DSL shorthands:

```tsx
<Button title="Save" onAction={[{ set: ['flow.saved', true] }]} />
```

## Data Source Example

```tsx
import { Contract, Navigation, Route, Text } from '@bdui/dsl';

export default (
  <Contract
    meta={{ contractId: 'demo', version: '1.0.0' }}
    dataSources={[
      {
        id: 'workspace',
        kind: 'rest',
        url: '/api/workspace',
        method: 'GET',
      },
    ]}
  >
    <Navigation initialRoute="home">
      <Route id="home">
        <Text>Hello BDUI</Text>
      </Route>
    </Navigation>
  </Contract>
);
```

See `examples/task-manager` for a complete production-style showcase.
