# Android Compose BDUI Renderer

The Android app has two demo flavors:

- `campusDebug` loads `app/src/main/assets/campus.contract.json` and renders the
  Russian Campus student mobile cabinet.
- `retailDebug` loads `app/src/main/assets/retail.contract.json` and renders the
  Luma Market commerce demo with the same product photos used by the web demo.

It is intentionally self-contained: the renderer reads plain JSON, owns runtime
state and executes a practical subset of SAL actions.

The renderer consumes the shared `modifiers` object for portable spacing,
padding, wrapping rows, colors, rounded panels, text weights and button styling.
PNG images referenced by the contract are loaded from bundled assets; SVG marks
fall back to compact native placeholders.

Open `native/android` in Android Studio and choose the build variant:

```text
Build Variants -> app -> retailDebug
```

Run the `app` configuration to launch Luma Market. Use `campusDebug` when you
need the Campus app.

Refresh the shared contracts after editing the TSX apps:

```powershell
npm.cmd run build:contracts
```
