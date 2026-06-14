# @bdui/renderer-web

DOM renderer for BDUI. It mounts a JSON contract into an HTML container and
delegates state, navigation, actions, flows, toasts and modals to
`@bdui/runtime`.

## API

```ts
import { mount } from '@bdui/renderer-web';

const app = mount(container, contract, {
  urlSync: true,
  validators: {
    nonEmpty: (value) => typeof value === 'string' && value.trim().length > 0,
  },
});

app.runtime.state.write('flow', 'counter', 1);
app.dispose();
```

`mount` creates a runtime with:

- a `localStorage`-backed storage adapter by default;
- a default `fetch`-backed `HttpClient` for `call` and REST/GraphQL `fetch`
  actions;
- optional validators for SAL `validate` actions;
- optional `prefetchScreens` hook.

Pass a custom `StorageAdapter` or `HttpClient` when your host app needs tighter
control.

## What The Plugin Does

- Renders the active `Route` or `FlowRoute`.
- Re-renders on state and navigation changes.
- Syncs the current route to `location.hash` when `urlSync` is enabled.
- Hosts toasts and modals through DOM controllers.
- Maps platform-neutral `modifiers` to inline CSS and supports a nested
  `modifiers.style` escape hatch for web-specific camelCase CSS.

No business logic lives in this package; it stays platform-neutral in
`@bdui/runtime`.

## Styling

The DOM renderer treats `modifiers` as the component-level design surface:

- numeric length values such as `padding`, `gap`, `borderRadius`, `minHeight`
  become `px`;
- `align` and `justify` map friendly values like `start`, `end`, `between` and
  `around` to flex CSS;
- semantic keys such as `role`, `variant`, `testId` and `accessibilityLabel`
  are not emitted as CSS;
- nested `style` is merged into the inline style object for web-only escape
  hatches.
