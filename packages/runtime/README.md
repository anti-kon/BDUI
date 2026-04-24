# @bdui/runtime

Platform-agnostic BDUI runtime. Sits between a JSON contract and a concrete
renderer plugin (web, iOS, Android, …) and owns everything that is not
rendering.

## What's inside

- **`RuntimeStateController`** — scoped state (`flow`, `session`, `local`,
  `params`) with event emission and optional session persistence via
  `StorageAdapter`.
- **`NavigationController`** — push/replace/back/popToRoot with history.
- **`FlowController`** + `resolveFlowStep` — guarded multi-step flows.
- **`ActionRunner`** — executes every SAL action with atomic batches and
  rollbacks, data-source `fetch`, and pluggable state validators.
- **`ContractLoader`** — fetches contracts with stale-while-revalidate.
- **`HttpClient`** — pluggable fetch abstraction.
- **`ToastController`**, **`ModalController`** — overlay state containers.
- **`RendererPlugin` interface** — renderers depend on this, not the other
  way around.

## Example

```ts
import { createFetchHttpClient, createRuntime, MemoryStorageAdapter } from '@bdui/runtime';

const runtime = createRuntime({
  contract,
  storage: new MemoryStorageAdapter(),
  http: createFetchHttpClient(),
  validators: {
    nonEmpty: (value) => typeof value === 'string' && value.trim().length > 0,
  },
});
runtime.use(myPlatformPlugin, container);
```

## Storage adapters

- `MemoryStorageAdapter` — for tests/server-side rendering.
- `createLocalStorageAdapter()` — browser storage wrapper.

Custom adapters implement the `StorageAdapter` interface.
