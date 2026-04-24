# Server Action Language (SAL)

SAL is the discriminated union used for every event handler in a BDUI
contract. Authors use short forms in TSX; the DSL normalises them into
the canonical `Action` shape at build time.

## Cheat sheet

| Canonical type               | Short form example                             | Meaning                                   |
| ---------------------------- | ---------------------------------------------- | ----------------------------------------- |
| `navigate`                   | `{ navigate: ['home', { mode: 'replace' }] }`  | Go to another route                       |
| `back`                       | `{ back: true }`                               | Pop the navigation stack                  |
| `popToRoot`                  | `{ popToRoot: true }`                          | Reset to `initialRoute`                   |
| `replace`                    | `{ replace: 'home' }`                          | Replace current route                     |
| `set`                        | `{ set: ['flow.name', 'Ann'] }`                | Set state at a target                     |
| `reset`                      | `{ reset: ['flow.x', 0] }`                     | Reset state to a value                    |
| `update.inc`                 | `{ inc: 'flow.x' }` / `{ inc: ['flow.x', 2] }` | Increment a number                        |
| `update.dec`                 | `{ dec: 'flow.x' }`                            | Decrement a number                        |
| `update.toggle`              | `{ toggle: 'flow.isOpen' }`                    | Toggle a boolean                          |
| `update.append`              | `{ append: ['flow.items', 'a'] }`              | Push to an array                          |
| `update.merge`               | `{ merge: ['flow.obj', { a: 1 }] }`            | Shallow-merge an object                   |
| `fetch`                      | `{ fetch: { sourceId, saveTo } }`              | Run a named data source                   |
| `call`                       | `{ call: { url, method, saveTo, rollback } }`  | Typed HTTP call with optional rollback    |
| `toast`                      | `{ toast: ['Saved'] }`                         | Show a toast notification                 |
| `modal.open` / `modal.close` | `{ modalOpen: 'confirm' }`                     | Control modals by id                      |
| `sync`                       | `{ sync: {} }`                                 | Force re-render / state sync              |
| `validate`                   | `{ validate: ['schema/x', 'flow.data'] }`      | Validate state against a named schema     |
| `prefetchScreens`            | `{ prefetch: ['checkout'] }`                   | Warm up routes                            |
| `batch`                      | `{ batch: [...], atomic: true }`               | Run nested actions, optionally atomically |
| `when`                       | `{ when: { if, then, else } }`                 | Conditional branch                        |
| `flow.start`                 | `{ flowStart: { routeId, params? } }`          | Begin a flow                              |
| `flow.advance`               | `{ flowAdvance: true }`                        | Evaluate transitions and move forward     |
| `flow.goTo`                  | `{ flowGoTo: { stepId } }`                     | Jump to a flow step                       |
| `flow.resume`                | `{ flowResume: true }`                         | Re-enter an interrupted flow              |
| `flow.abort`                 | `{ flowAbort: { reason? } }`                   | Cancel a flow                             |
| `flow.complete`              | `{ flowComplete: true }`                       | Mark flow complete                        |

## Targets

Any action that touches state accepts one of three target forms:

- A string path — `"flow.counter"`, `"session.user.name"`.
- A `{ scope, path }` object.
- A `StateVar` handle produced by `Flow()`, `Session()`, or `Local()`.

## Atomic batches and rollbacks

- `batch` with `atomic: true` rolls back _already-applied state writes_ if any
  nested action throws.
- `call` with a `rollback` field compensates previously applied state changes
  if the HTTP request fails.

## Data sources and validation

- `fetch` resolves `contract.dataSources[]` entries by `sourceId`.
- `static` data sources are resolved locally; `rest` and `graphql` sources use
  the runtime `HttpClient`.
- `fetch.saveTo` stores the result in a state target. When omitted, the runtime
  writes to `local.dataSources.<sourceId>`.
- `validate` calls a validator registered in `createRuntime({ validators })` or
  `createActionRunner({ validators })`. Results are stored in
  `local.__validation[schemaRef]`; failed validation also emits an `error`
  event.

## Guard expressions in `when`

The `if` field accepts either a raw string or an `ExprRef`. The string form is
automatically wrapped by the DSL.

## Safety

Actions never contain executable JavaScript. Expressions run through
`@bdui/expr` with a strict allow-list of identifiers and built-ins.
