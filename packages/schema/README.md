# @bdui/schema

Strict JSON Schema generation and runtime validation for BDUI contracts.

## How it works

`scripts/generate.cjs` reads `@bdui/core` and `@bdui/defs` to produce a
canonical `contract.schema.json` / `schema.generated.ts`. The generator:

- emits a dedicated `$defs/Action` built from the TypeScript `Action` union,
- rewrites every `ExprRef` pattern (`^{{.+}}$`) as a reusable `$defs/ExprRef`,
- enforces `additionalProperties: false` on nodes and `meta`,
- creates per-component `Node_<Component>` definitions and a root
  `oneOf`-based `Node` union,
- rebases legacy `#/definitions/…` refs to `#/$defs/…`.

## Runtime validation

```ts
import { validateContract, assertValidContract } from '@bdui/schema';

const report = validateContract(json);
if (!report.ok) console.error(report.errors);

assertValidContract(json); // throws ContractValidationError
```

The runtime uses `ajv/dist/2020.js` with `ajv-formats` so `date-time`, `uri`,
etc. are validated as expected.
