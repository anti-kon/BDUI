# @bdui/runtime

Platform-neutral BDUI runtime. It sits between a JSON contract and concrete
renderers such as web, Android and iOS.

## What's Inside

- `RuntimeStateController` for `flow`, `session`, `local` and `params` state.
- `NavigationController` for push, replace, back and pop-to-root navigation.
- `FlowController` and `resolveFlowStep` for guarded multi-step flows.
- `ActionRunner` for SAL actions, including atomic batches, rollbacks,
  `call`, data-source `fetch`, `validate`, toasts and modal commands.
- `ContractLoader` with stale-while-revalidate semantics and ETag support.
- `HttpClient` abstraction plus `createFetchHttpClient()`.
- `MemoryStorageAdapter` and `createLocalStorageAdapter()`.
- `RendererPlugin` interface used by platform renderers.

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

## Contract Cache

`createContractLoader()` resolves contracts with stale-while-revalidate
behavior:

1. Fresh cached contracts return immediately.
2. Stale cached contracts return immediately and revalidate in the background.
3. Missing contracts are fetched before rendering.

The Taskly Operations example uses this loader in `examples/task-manager`.
