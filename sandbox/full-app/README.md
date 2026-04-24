# sandbox/full-app

End-to-end BDUI example that exercises the full DSL / SAL surface:

- `Input`, `Select`, `Checkbox`, `Divider`, `If` components with two-way bindings.
- `when` guarded actions, `batch` with `atomic: true` + `rollback` via `call`.
- Session/flow state defaults surfaced through `Flow()`/`Session()`.
- Server request triggered from the client, with automatic rollback of pending
  state when the request fails.

## Build

```bash
npm run bdui -- build sandbox/full-app/src/entry.tsx -o sandbox/full-app/contract.json --mode dev
```

The generated `contract.json` is ready to be served and loaded by any
`@bdui/renderer-web`-based page.
