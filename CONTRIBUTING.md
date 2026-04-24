# Contributing to BDUI

Thank you for considering a contribution. BDUI is a TypeScript monorepo
managed with npm workspaces. Please read the short guide below before opening
your first PR.

## Layout

```
packages/
  core/           Types and small helpers; no side effects
  expr/           Expression language (lexer/parser/interpreter)
  schema/         JSON Schema generation and Ajv validator
  defs/           Component manifests and DOM renderers
  dsl/            TSX DSL and action shorthands
  transpiler/    TSX → canonical JSON contract
  runtime/        State, navigation, actions, flow, toast, modal, HTTP
  renderer-web/   DOM plugin on top of runtime
  registry/       Fastify-based contract registry
  sdk/            RegistryClient + Fastify/Express adapters
  cli/            bdui command-line interface

docs/             Long-form documentation
sandbox/          Example apps / playground
```

## Local setup

```bash
npm install
npm run build:full
npm test
```

`build:full` regenerates schemas and DSL glue before compiling each package.
If you only changed one package, run `npm run -w packages/<name> build`.

## Scripts

| Script              | What it does                            |
| ------------------- | --------------------------------------- |
| `npm test`          | Run the full vitest suite               |
| `npm run typecheck` | `tsc --noEmit` across the workspace     |
| `npm run lint`      | ESLint across every package             |
| `npm run format`    | Prettier write                          |
| `npm run gen`       | Regenerate schema + DSL glue            |
| `npm run build`     | Full build (equivalent to `build:full`) |
| `npm run bdui`      | Invoke the local CLI                    |

## Style

- TypeScript `strict: true`.
- No `any`. Prefer `unknown` + narrowing.
- No `new Function` / `eval`. Expressions must go through `@bdui/expr`.
- Avoid comments that restate code. Only explain intent or constraints.

## Testing

- Add unit tests next to the code under `src/__tests__/*.test.ts`.
- Integration tests live inside the owning package (e.g.
  `packages/renderer-web/src/__tests__/integration.test.ts`).
- When changing public behaviour, update the docs in `/docs` and the
  package-level README.

## Versioning & changelog

The workspace uses a single pinned version across packages during the alpha
phase. When introducing a breaking change, update `CHANGELOG.md`.

## Commits and pull requests

- Prefer conventional commit prefixes (`feat:`, `fix:`, `docs:`).
- Include a summary of the why, not just the what.
- Ensure `npm test`, `npm run typecheck`, and `npm run lint` pass locally.
