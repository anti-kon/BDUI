# Contract Specification

This document describes the on-the-wire shape of a BDUI contract. The
authoritative schema lives in `packages/schema/src/generated/schema.generated.ts`
and is derived from the TypeScript types in `@bdui/core`.

## Top-level shape

```json
{
  "meta": {
    "contractId": "string",
    "version": "semver",
    "schemaVersion": "semver",
    "generatedAt": "ISO-8601",
    "appId": "string?",
    "features": ["flow", "actions/call", "..."]
  },
  "initial": {
    "flow": { "counter": 0 },
    "session": { "userId": null }
  },
  "navigation": {
    "initialRoute": "home",
    "urlSync": false,
    "routes": [{ "id": "home", "node": { "type": "Column", "children": [] } }]
  },
  "dataSources": {
    "users": { "url": "https://api/users", "method": "GET" }
  }
}
```

`additionalProperties: false` is enforced on every object (`meta`, `navigation`,
nodes). Unknown fields cause validation errors.

## Nodes

Every node carries a `type`, optional `modifiers`, optional `children`, and
component-specific props.

```json
{
  "type": "Button",
  "title": "Submit",
  "variant": "primary",
  "onAction": [{ "type": "navigate", "params": { "to": "next" } }],
  "children": []
}
```

The generator emits one `Node_<Component>` definition per manifest and unites
them via `oneOf` on the root `Node` type.

## Routes

Routes come in two flavours:

- **Screen route** — static `node` tree.
- **Flow route** — `type: "flow"`, `startStep`, `steps[]` with guarded
  `transitions`.

## Expressions

Expressions are serialised as `"{{ ... }}"` strings. Values typed as
`Expression<T>` accept either a literal `T` or such a string. The schema
validates expression strings against a conservative pattern; actual grammar
is enforced at parse time by `@bdui/expr`.

## Actions

Actions are strongly-typed via the `Action` union (see [`actions.md`](./actions.md)).
Event props like `onAction`, `onEnter`, `onSubmit` always carry an array of
actions — never a string of arbitrary JavaScript.

## Canonicalisation

Contracts produced by `@bdui/transpiler` are canonicalised:

- object keys are sorted alphabetically,
- `undefined` values are stripped,
- arrays keep authoring order,
- no trailing whitespace or BOM.

This guarantees byte-stable hashes and deterministic ETags in the registry.
