# Android Compose BDUI Renderer

The Android app loads `app/src/main/assets/campus.contract.json` and renders the
Russian Campus student mobile cabinet with Jetpack Compose. It is intentionally
self-contained: the renderer reads plain JSON, owns runtime state and executes a
practical subset of SAL actions.

The renderer consumes the shared `modifiers` object for portable spacing,
padding, text roles and button variants. Web-only CSS escape hatches are ignored.

Open `native/android` in Android Studio and run the `app` configuration.

Refresh the shared contract after editing the TSX app:

```powershell
npm.cmd run bdui -- build examples/ops-control/src/app.tsx -o examples/ops-control/contract.json --mode prod
Copy-Item examples/ops-control/contract.json native/android/app/src/main/assets/campus.contract.json -Force
```
