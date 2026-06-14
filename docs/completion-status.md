# BDUI completion status

Status date: 2026-06-14.

This checklist maps the requirements from `НИР Конопелькин АЕ.docx`, chapter 2,
to repository evidence and verification commands.

## Requirement status

| Requirement area                                                    | Status                                            | Evidence                                                                                                                                              |
| ------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| JSON contract format, metadata, initial state and schema validation | Complete                                          | `@bdui/core`, `@bdui/schema`, generated schema, `npm run verify:contracts`                                                                            |
| TSX to JSON translation                                             | Complete                                          | `@bdui/dsl`, `@bdui/transpiler`, `bdui build`, sandbox and example contracts                                                                          |
| Deterministic contract output                                       | Complete                                          | canonical serializer in `@bdui/transpiler`, stable default `generatedAt`, build tests, generated contract checks                                      |
| Web rendering                                                       | Complete locally and browser CI configured        | `@bdui/runtime`, `@bdui/renderer-web`, renderer integration tests, `sandbox/web-demo`, `npm run verify:browser`, CI Playwright smoke                  |
| Production showcase application                                     | Complete locally and browser CI configured        | `examples/task-manager`, `npm run verify:examples`, `npm run verify:taskly-browser`, CI Taskly browser smoke                                          |
| Android/iOS native rendering prototypes                             | Implementation complete, CI acceptance configured | `native/android`, `native/ios`, `docs/native-renderers.md`, `npm run verify:native`, CI Android assemble, CI iOS Swift typecheck                      |
| Flow scenarios                                                      | Complete                                          | flow types, DSL builders, runtime flow controller, sandbox flow contracts, tests                                                                      |
| SAL client/server/flow actions                                      | Complete                                          | typed `Action` union, DSL shorthands, runtime action runner, `fetch`, `call`, `validate`, flow actions                                                |
| Modular layered architecture                                        | Complete                                          | workspace package split, `docs/architecture.md`, `npm run build:full`                                                                                 |
| Reliability and diagnostics                                         | Complete                                          | schema validation, typed errors, renderer fallback behaviour, registry error bodies                                                                   |
| Security                                                            | Complete locally                                  | safe expression interpreter, no `eval`/`new Function`, registry bearer auth/CORS controls, `npm run audit:all`                                        |
| External APIs and SDK                                               | Complete                                          | `docs/registry-api.md`, `@bdui/sdk`, CLI registry options                                                                                             |
| Developer interfaces                                                | Complete                                          | TSX DSL, CLI, package READMEs, getting started guide                                                                                                  |
| Documentation set                                                   | Complete                                          | `README.md`, `docs/spec.md`, `docs/actions.md`, `docs/expr.md`, `docs/registry-api.md`, `docs/native-renderers.md`, `CONTRIBUTING.md`, `CHANGELOG.md` |
| Open-source maintenance process                                     | Complete                                          | Apache 2.0 license, changeset config, changelog, contribution guide, release CI                                                                       |
| Automated local verification                                        | Complete                                          | `npm run verify:all`, plus `npm run verify:taskly-browser` for full Taskly runtime smoke                                                              |

## Local acceptance command

```bash
npm run verify:all
```

This command covers generation/build, type checking, linting, formatting, unit
and integration tests, coverage thresholds, contract synchronization, native
contract coverage and dependency audit.

The standalone production-style Taskly acceptance smoke is:

```bash
npm run verify:taskly-browser
```

It starts the compiled Fastify app on a free local port and verifies contract
cache state, modal open/close, REST data source refresh, static catalog loading
and the three-step request flow through a real Chromium page.

## External acceptance gates

These gates require tools that are not fully available in the current Windows
sandbox. They are now represented as CI jobs, and the local status below records
what was actually executed in this workspace.

| Gate                                           | Status                                                                                    | Command or action                                                                                                      |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Android native build and emulator/device smoke | CI Android assemble job configured; local Gradle/Android SDK unavailable                  | CI runs `gradle -p native/android :app:assembleDebug`; device/emulator smoke remains a hardware/runtime acceptance     |
| iOS native build and simulator/device smoke    | CI iOS Swift typecheck job configured; local Xcode unavailable                            | CI runs `xcrun swiftc -typecheck` for iOS simulator; full Xcode app launch remains a macOS simulator/device acceptance |
| Cross-browser visual smoke                     | Chromium passed locally; Firefox launch is blocked by this Windows sandbox graphics stack | CI installs Playwright browsers and runs `npm run verify:browsers`                                                     |

Until CI is run on GitHub and mobile device/simulator smoke is performed,
repository-local implementation is complete while hardware/runtime acceptance
remains environment-bound.
