import Foundation
import SwiftUI

final class BDUIRuntime: ObservableObject {
    let contract: [String: Any]

    @Published var currentRoute: String
    @Published var flow: [String: Any]
    @Published var session: [String: Any]
    @Published var local: [String: Any] = [:]
    @Published var toastMessage: String?

    private var backStack: [String]
    private var flowSteps: [String: String] = [:]

    init(contract: [String: Any]) {
        self.contract = contract
        let navigation = contract["navigation"] as? [String: Any]
        let initial = contract["initial"] as? [String: Any]
        currentRoute = navigation?["initialRoute"] as? String ?? "home"
        backStack = [currentRoute]
        flow = initial?["flow"] as? [String: Any] ?? [:]
        session = initial?["session"] as? [String: Any] ?? [:]
    }

    static func loadBundledContract(named resourceName: String = "campus.contract") -> BDUIRuntime {
        let nsName = resourceName as NSString
        let ext = nsName.pathExtension.isEmpty ? "json" : nsName.pathExtension
        let base = nsName.pathExtension.isEmpty ? resourceName : nsName.deletingPathExtension

        guard let url = Bundle.main.url(forResource: base, withExtension: ext),
              let data = try? Data(contentsOf: url),
              let object = try? JSONSerialization.jsonObject(with: data),
              let contract = object as? [String: Any] else {
            return BDUIRuntime(contract: [
                "navigation": ["initialRoute": "home", "routes": [[String: Any]]()],
                "initial": ["flow": [String: Any](), "session": [String: Any]()]
            ])
        }
        return BDUIRuntime(contract: contract)
    }

    var currentRouteObject: [String: Any]? {
        findRoute(id: currentRoute)
    }

    func currentFlowStep(in route: [String: Any]) -> [String: Any]? {
        let routeId = route["id"] as? String ?? currentRoute
        let stepId = flowSteps[routeId] ?? route["startStep"] as? String
        let steps = route["steps"] as? [[String: Any]] ?? []
        return steps.first { $0["id"] as? String == stepId }
    }

    func read(_ binding: [String: Any]?) -> Any? {
        guard let binding else { return nil }
        return read(scope: binding["scope"] as? String, path: binding["path"] as? String)
    }

    func read(scope: String?, path: String?) -> Any? {
        guard let scope, let path else { return nil }
        switch scope {
        case "session": return session[path]
        case "local": return local[path]
        default: return flow[path]
        }
    }

    func write(_ binding: [String: Any]?, value: Any?) {
        guard let binding,
              let scope = binding["scope"] as? String,
              let path = binding["path"] as? String else { return }
        let normalized = value is NSNull ? nil : value
        switch scope {
        case "session":
            var next = session
            next[path] = normalized
            session = next
        case "local":
            var next = local
            next[path] = normalized
            local = next
        default:
            var next = flow
            next[path] = normalized
            flow = next
        }
    }

    func stringBinding(_ binding: [String: Any]?) -> Binding<String> {
        Binding(
            get: { self.read(binding).map { "\($0)" } ?? "" },
            set: { self.write(binding, value: $0) }
        )
    }

    func boolBinding(_ binding: [String: Any]?) -> Binding<Bool> {
        Binding(
            get: { self.read(binding) as? Bool ?? false },
            set: { self.write(binding, value: $0) }
        )
    }

    func run(actions raw: Any?) {
        guard let actions = raw as? [[String: Any]] else { return }
        actions.forEach(run(action:))
    }

    private func run(action: [String: Any]) {
        let type = action["type"] as? String ?? ""
        let params = action["params"] as? [String: Any] ?? [:]

        switch type {
        case "navigate":
            navigate(to: params["to"] as? String ?? "", mode: params["mode"] as? String ?? "push")
        case "replace":
            navigate(to: params["to"] as? String ?? "", mode: "replace")
        case "back":
            back()
        case "popToRoot":
            popToRoot()
        case "set":
            write(params["target"] as? [String: Any], value: BDUIExpression.resolve(params["value"], runtime: self))
        case "reset":
            write(params["target"] as? [String: Any], value: nil)
        case "update.inc":
            let target = params["target"] as? [String: Any]
            let current = BDUIExpression.asDouble(read(target))
            let by = BDUIExpression.asDouble(BDUIExpression.resolve(params["by"], runtime: self), defaultValue: 1)
            write(target, value: current + by)
        case "update.dec":
            let target = params["target"] as? [String: Any]
            let current = BDUIExpression.asDouble(read(target))
            let by = BDUIExpression.asDouble(BDUIExpression.resolve(params["by"], runtime: self), defaultValue: 1)
            write(target, value: current - by)
        case "update.toggle":
            let target = params["target"] as? [String: Any]
            write(target, value: !(read(target) as? Bool ?? false))
        case "batch":
            run(actions: params["actions"])
        case "when":
            let branch = BDUIExpression.evalBool(params["if"], runtime: self) ? params["then"] : params["else"]
            run(actions: branch)
        case "toast":
            toastMessage = BDUIExpression.interpolate(params["message"], runtime: self)
        case "flow.start":
            let routeId = params["routeId"] as? String ?? ""
            if let route = findRoute(id: routeId), let start = route["startStep"] as? String {
                flowSteps[routeId] = start
            }
            navigate(to: routeId, mode: "push")
        case "flow.goTo":
            let routeId = params["routeId"] as? String ?? currentRoute
            flowSteps[routeId] = params["stepId"] as? String
            objectWillChange.send()
        case "flow.complete", "flow.abort":
            let routeId = params["routeId"] as? String ?? currentRoute
            flowSteps.removeValue(forKey: routeId)
            objectWillChange.send()
        case "call":
            if let saveTo = params["saveTo"] as? [String: Any] {
                write(saveTo, value: "native-ok")
            }
        default:
            break
        }
    }

    private func navigate(to routeId: String, mode: String) {
        guard !routeId.isEmpty else { return }
        switch mode {
        case "replace":
            if !backStack.isEmpty { backStack.removeLast() }
            backStack.append(routeId)
        case "popToRoot":
            backStack.removeAll()
            backStack.append(routeId)
        default:
            backStack.append(routeId)
        }
        currentRoute = routeId
    }

    private func back() {
        if backStack.count > 1 {
            backStack.removeLast()
            currentRoute = backStack.last ?? currentRoute
        }
    }

    private func popToRoot() {
        guard let root = backStack.first else { return }
        backStack = [root]
        currentRoute = root
    }

    private func findRoute(id: String) -> [String: Any]? {
        let navigation = contract["navigation"] as? [String: Any]
        let routes = navigation?["routes"] as? [[String: Any]] ?? []
        return routes.first { $0["id"] as? String == id }
    }
}
