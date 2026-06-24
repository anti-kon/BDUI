# Быстрый старт BDUI

BDUI - стек Backend-Driven UI, построенный вокруг трех идей:

1. Интерфейс описывается в TSX через строго типизированный DSL.
2. Описание компилируется в канонический JSON-контракт, проверяемый схемой.
3. Один и тот же контракт отображается на разных платформах через небольшой
   runtime-плагин.

Этот документ показывает базовую настройку workspace и сборку первого экрана
на BDUI.

## 1. Требования

- Node.js 24 или новее
- npm 10 или новее
- Unix-подобная оболочка (macOS, Linux, WSL) или PowerShell в Windows

## 2. Установка зависимостей

```bash
npm install
npm run build:full
```

Команда `build:full` пересоздает JSON Schema и DSL-связки, после чего собирает
все пакеты workspace.

## 3. Описание экрана в TSX

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

## 4. Компиляция

```bash
npx bdui build ./path/to/screen.tsx -o ./build/home.json
```

CLI вызывает `@bdui/transpiler`, который:

- собирает TSX через esbuild;
- проверяет полученный объект по сгенерированной JSON Schema;
- записывает канонический и детерминированный JSON.

## 5. Отображение в браузере

```ts
import { mount } from '@bdui/renderer-web';
import contract from './build/home.json';

const container = document.getElementById('app')!;
mount(container, contract);
```

Состояние, навигация, flow, уведомления и действия доступны через runtime,
возвращаемый функцией `mount`.

## Следующие шаги

- [`architecture.md`](./architecture.md) описывает слои платформы.
- [`spec.md`](./spec.md) описывает формат контракта.
- [`actions.md`](./actions.md) содержит справочник SAL-действий.
- `bdui registry --port 4000` запускает реестр контрактов BDUI; HTTP API
  описан в [`registry-api.md`](./registry-api.md).
