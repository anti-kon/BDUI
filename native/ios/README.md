# iOS SwiftUI BDUI renderer

`OpsControl/` contains a complete SwiftUI source set for the Russian Кампус
native application. The app loads `Resources/campus.contract.json`, interprets
the BDUI tree and executes the same core SAL subset as the Android renderer.

To run it in Xcode:

1. Create a new iOS App project named `Campus`.
2. Add the Swift files from `native/ios/OpsControl/`.
3. Add `Resources/campus.contract.json` to the app target.
4. Run on iOS 16 or newer.

Refresh the shared contract after editing the TSX app:

```powershell
npm.cmd run bdui -- build examples/ops-control/src/app.tsx -o examples/ops-control/contract.json --mode prod
Copy-Item examples/ops-control/contract.json native/ios/OpsControl/Resources/campus.contract.json -Force
```
