import SwiftUI

@main
struct CampusApp: App {
    @StateObject private var runtime = BDUIRuntime.loadBundledContract()

    var body: some Scene {
        WindowGroup {
            BDUIRenderer(runtime: runtime)
        }
    }
}
