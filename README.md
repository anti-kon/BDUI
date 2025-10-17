# BDUI Monorepo (v0.4) — SAL + New Manifests

- @bdui/defs — component manifests (TS-first, props types co-located)
- @bdui/dsl — JSX DSL runtime (E() helper + SAL actions) + generated components
- @bdui/schema — JSON Schema generator + validator (glob over defs/src/\*_/_.ts)
- @bdui/transpiler — TSX → JSON contract bundler (esbuild)
- @bdui/cli — CLI (bdui gen/build/validate)
- sandbox/counter — sample project

## One command

```bash
npm i
npm run build:full
npm run bdui -- build sandbox/counter/src/entry.tsx -o sandbox/counter/contract.json --mode dev
```

## Линтинг и форматирование

В репозитории настроены ESLint и Prettier для TypeScript/TSX/JSON в пакетах (`packages/*`) и песочнице (`sandbox/`).

Скрипты:

- `npm run lint` — проверка ESLint
- `npm run lint:fix` — авто-исправление ESLint
- `npm run format` — форматирование Prettier
- `npm run format:check` — проверка форматирования Prettier
