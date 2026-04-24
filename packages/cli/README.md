# @bdui/cli — `bdui`

Command-line interface for the BDUI stack.

## Installation

```bash
npm install -g @bdui/cli
# or use it from the monorepo
npm run bdui -- --help
```

## Commands

| Command                | What it does                                          |
| ---------------------- | ----------------------------------------------------- |
| `bdui gen`             | Regenerate JSON Schema and DSL glue from `@bdui/defs` |
| `bdui build <entry>`   | Transpile a TSX entry into canonical JSON             |
| `bdui watch <entry>`   | Rebuild on filesystem changes                         |
| `bdui validate <file>` | Validate a JSON contract against the schema           |
| `bdui registry`        | Start the HTTP registry server (in-memory or on disk) |

### Common flags

- `--out <file>` — write output JSON to `<file>` instead of stdout.
- `--mode dev|prod` — selects esbuild minification/source-map behaviour.
- `--data-dir <dir>` — use filesystem storage for the registry.
- `--no-validate` — disable schema validation (build or registry publish).

### Programmatic API

Use `runGen`, `runWatch`, and `runRegistry` from `@bdui/cli/commands/*` when
embedding the CLI in automation scripts. They take the same options as the
flags above.
