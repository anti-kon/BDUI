import SwiftUI

@main
struct CampusApp: App {
    @StateObject private var runtime = BDUIRuntime.loadBundledContract(named: "campus.contract")

    var body: some Scene {
        WindowGroup {
            BDUIRenderer(runtime: runtime)
        }
    }
}
