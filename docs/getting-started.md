# Getting Started with BDUI

BDUI is a Backend-Driven UI stack built around three ideas:

1. Declare the UI in TSX using a strongly-typed DSL.
2. Compile it into a canonical, schema-validated JSON contract.
3. Render the same contract on any platform through a small runtime plugin.

This guide walks you through setting up the workspace and producing your first
BDUI-powered screen.

## 1. Prerequisites

- Node.js 22 or newer
- npm 10 or newer
- A Unix-like shell (macOS, Linux, WSL) or PowerShell on Windows

## 2. Install dependencies

```bash
npm install
npm run build:full
```

`build:full` regenerates JSON schema and DSL glue and then builds every
package.

## 3. Author a screen in TSX

```tsx
import { App, Screen, Row, Column, Text, Button } from '@bdui/dsl';
import { Flow, bind } from '@bdui/dsl';

export default App({
  meta: { appId: 'demo', version: '1.0.0' },
  routes: [
    Screen({
      id: 'home',
      title: 'Home',
      node: (() => {
        const counter = Flow<number>('counter', 0);
        return Column({
          children: [
            Text({ text: 'Hello, BDUI' }),
            Button({
              title: 'Increment',
              onAction: [{ inc: bind(counter) }],
            }),
            Text({ text: 'count={{flow.counter}}' }),
          ],
        });
      })(),
    }),
  ],
});
```

## 4. Compile it

```bash
npx bdui build ./path/to/screen.tsx -o ./build/home.json
```

The CLI invokes `@bdui/transpiler`, which:

- bundles the TSX with esbuild,
- validates the resulting object against the generated JSON Schema,
- emits a canonical, deterministic JSON payload.

## 5. Render it in the browser

```ts
import { mount } from '@bdui/renderer-web';
import contract from './build/home.json';

const container = document.getElementById('app')!;
mount(container, contract);
```

That's it. State, navigation, flows, toasts and actions are all available
through the runtime instance returned by `mount`.

## Next steps

- Read [`architecture.md`](./architecture.md) for how the layers fit together.
- Study [`spec.md`](./spec.md) for the full on-wire contract shape.
- Browse [`actions.md`](./actions.md) to see every SAL action at a glance.
- Run `bdui registry --port 4000` to publish contracts to the BDUI Registry
  (see [`registry-api.md`](./registry-api.md)).
