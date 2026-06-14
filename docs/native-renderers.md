# Native Renderer Prototypes

The mobile extension adds native BDUI renderer prototypes for Android and iOS.
Both platforms render one shared contract from `examples/ops-control`.

## Shared Application

`examples/ops-control/src/app.tsx` defines Campus, a Russian production-like
student mobile cabinet implemented entirely as a BDUI contract. The contract
contains:

- `home`, `schedule`, `assignments`, `deanery`, `pass` and `settings` screen
  routes;
- a `deanery-request` flow route with three request-submission steps;
- `flow` state for timetable, assignment checklist, deanery request and pass
  data;
- `session` state for student profile, campus and notification settings;
- validation, conditional hints, route navigation, local state updates and
  toast feedback.

Build and validate the canonical JSON:

```bash
npm run bdui -- build examples/ops-control/src/app.tsx -o examples/ops-control/contract.json --mode prod
npm run bdui -- validate examples/ops-control/contract.json
```

## Android Renderer

`native/android` is a Jetpack Compose application. It loads
`app/src/main/assets/campus.contract.json`, keeps runtime state in Compose state
maps, resolves `{{scope.path}}` expressions and renders the core component set:

- `Column`, `Row`, `Text`, `Button`;
- `Image` with a local fallback mark renderer;
- `Input`, `Checkbox`, `Select`;
- `If`, `Divider`.

The Android action runner supports the practical SAL subset required by Campus:
navigation, state mutation, counters, toggles, batches, conditions, toasts and
flow step transitions.

## iOS Renderer

`native/ios/OpsControl` is a SwiftUI source set with the same renderer contract.
It loads `Resources/campus.contract.json`, stores state in an `ObservableObject`
runtime and renders the same component/action subset using native SwiftUI views:
`VStack`, `HStack`, `Text`, `TextField`, `Toggle`, `Picker` and `Button`.

## Modifiers

Both native prototypes consume the same `modifiers` object as web contracts, but
they intentionally implement a portable subset: spacing, padding, text roles
and button variants. Web-only CSS escape hatches such as nested
`modifiers.style` are ignored by native renderers. This keeps the contract shape
shared while avoiding a false promise that arbitrary CSS can be rendered
identically on Compose and SwiftUI.

## Contract Refresh

After changing the TSX contract, regenerate and copy the JSON:

```powershell
npm.cmd run bdui -- build examples/ops-control/src/app.tsx -o examples/ops-control/contract.json --mode prod
Copy-Item examples/ops-control/contract.json native/android/app/src/main/assets/campus.contract.json -Force
Copy-Item examples/ops-control/contract.json native/ios/OpsControl/Resources/campus.contract.json -Force
Copy-Item examples/ops-control/contract.json sandbox/web-demo/contract.json -Force
```

This keeps Android, iOS and the web preview tied to the same source of truth.
