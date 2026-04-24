# @bdui/transpiler

TSX → canonical JSON pipeline for BDUI.

## Pipeline

1. **Bundle** the entry `.tsx` with esbuild using `@bdui/dsl/jsx-runtime` as
   the JSX import source.
2. **Load** the resulting module (`default` export or named `contract`).
3. **Validate** the object against the JSON Schema from `@bdui/schema`.
4. **Canonicalise** the object (sort keys, strip `undefined`) so the output
   is byte-stable and ETag-friendly.
5. **Write** the JSON (or return it programmatically).

Source maps are preserved end-to-end so validation errors point back at the
original TSX source.

## Usage

```ts
import { buildContract } from '@bdui/transpiler';

const { json, contract } = await buildContract({
  entry: './app.tsx',
  outFile: './app.json',
  mode: 'prod',
});
```

Also available via the CLI: `bdui build ./app.tsx -o app.json --mode prod`.
