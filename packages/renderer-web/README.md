# @bdui/renderer-web

DOM renderer plugin for BDUI. Thin shell on top of `@bdui/runtime` — does
rendering and nothing else.

## API

```ts
import { mount } from '@bdui/renderer-web';

const app = mount(container, contract, {
  urlSync: true,
});
app.runtime.state.write('flow', 'counter', 1);
app.dispose();
```

Internally, `mount` constructs a `Runtime` with a default localStorage
adapter and registers the DOM `RendererPlugin`. Plug in a custom
`StorageAdapter` or `HttpClient` if needed.

## What the plugin does

- Renders the active route (`RouteScreen` or `FlowRouteScreen`).
- Subscribes to state/navigation changes and re-renders.
- Attaches optional `hashchange` URL sync when `urlSync` is enabled.
- Hosts toasts and modals via DOM controllers.

No state or action logic lives here; everything is delegated to
`@bdui/runtime`.
