# iOS SwiftUI BDUI Renderer

`OpsControl/` contains a complete SwiftUI source set for the Russian Campus
native application. The resource folder also contains `retail.contract.json` for
the Luma Market mobile demo. The renderer interprets the BDUI tree and executes
the same core SAL subset as the Android renderer.

The renderer consumes the shared `modifiers` object for portable spacing,
padding, text roles and button variants. Web-only CSS escape hatches are ignored.

To run Campus in Xcode:

1. Create a new iOS App project named `Campus`.
2. Add the Swift files from `native/ios/OpsControl/`.
3. Add `Resources/campus.contract.json` to the app target.
4. Run on iOS 16 or newer.

To create a Luma Market target, add `Resources/retail.contract.json` and the
`Resources/products/*.png` assets to the app target, then load the retail
contract instead of `campus.contract.json`.

Refresh the shared contracts after editing the TSX apps:

```powershell
npm.cmd run build:contracts
```
