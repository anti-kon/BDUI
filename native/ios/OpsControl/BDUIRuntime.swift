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

    static func loadBundledContract() -> BDUIRuntime {
        guard let url = Bundle.main.url(forResource: "campus.contract", withExtension: "json"),
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

enum BDUIExpression {
    static func interpolate(_ value: Any?, runtime: BDUIRuntime) -> String {
        let resolved = resolve(value, runtime: runtime)
        guard let raw = resolved as? String else { return resolved.map { "\($0)" } ?? "" }
        return replaceExpressions(in: raw) { code in
            evalScalar(code, runtime: runtime).map { "\($0)" } ?? ""
        }
    }

    static func resolve(_ value: Any?, runtime: BDUIRuntime) -> Any? {
        if let dict = value as? [String: Any], dict["__bduiExpr"] as? Bool == true {
            return evalScalar(dict["code"] as? String ?? "", runtime: runtime)
        }
        if let string = value as? String, let code = wholeExpressionCode(string) {
            return evalScalar(code, runtime: runtime)
        }
        if value is NSNull { return nil }
        return value
    }

    static func evalBool(_ value: Any?, runtime: BDUIRuntime) -> Bool {
        guard let code = expressionCode(value) else { return false }
        return code.components(separatedBy: "||").contains { part in
            part.components(separatedBy: "&&").allSatisfy { evalComparison($0, runtime: runtime) }
        }
    }

    static func asDouble(_ value: Any?, defaultValue: Double = 0) -> Double {
        if let number = value as? NSNumber { return number.doubleValue }
        if let double = value as? Double { return double }
        if let int = value as? Int { return Double(int) }
        if let string = value as? String, let double = Double(string) { return double }
        return defaultValue
    }

    private static func evalComparison(_ raw: String, runtime: BDUIRuntime) -> Bool {
        let code = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        for op in ["==", "!=", ">=", "<=", ">", "<"] {
            if let range = code.range(of: op) {
                let left = evalScalar(String(code[..<range.lowerBound]), runtime: runtime)
                let right = evalScalar(String(code[range.upperBound...]), runtime: runtime)
                return compare(left, right, op)
            }
        }
        return truthy(evalScalar(code, runtime: runtime))
    }

    private static func evalScalar(_ raw: String, runtime: BDUIRuntime) -> Any? {
        let code = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        if code == "true" { return true }
        if code == "false" { return false }
        if code == "null" { return nil }
        if let number = Double(code) { return number }
        if (code.hasPrefix("'") && code.hasSuffix("'")) || (code.hasPrefix("\"") && code.hasSuffix("\"")) {
            return String(code.dropFirst().dropLast())
        }
        if code.hasPrefix("len("), code.hasSuffix(")") {
            let inner = String(code.dropFirst(4).dropLast())
            return "\(evalScalar(inner, runtime: runtime) ?? "")".count
        }
        let pieces = code.split(separator: ".", maxSplits: 1).map(String.init)
        if pieces.count == 2 {
            return runtime.read(scope: pieces[0], path: pieces[1])
        }
        return code
    }

    private static func compare(_ left: Any?, _ right: Any?, _ op: String) -> Bool {
        let lnum = asDouble(left, defaultValue: .nan)
        let rnum = asDouble(right, defaultValue: .nan)
        let numeric = !lnum.isNaN && !rnum.isNaN
        switch op {
        case "==": return "\(left ?? "")" == "\(right ?? "")" || (numeric && lnum == rnum)
        case "!=": return "\(left ?? "")" != "\(right ?? "")" && (!numeric || lnum != rnum)
        case ">": return numeric && lnum > rnum
        case "<": return numeric && lnum < rnum
        case ">=": return numeric && lnum >= rnum
        case "<=": return numeric && lnum <= rnum
        default: return false
        }
    }

    private static func truthy(_ value: Any?) -> Bool {
        if value == nil || value is NSNull { return false }
        if let bool = value as? Bool { return bool }
        if let number = value as? NSNumber { return number.doubleValue != 0 }
        if let string = value as? String { return !string.isEmpty }
        return true
    }

    private static func expressionCode(_ value: Any?) -> String? {
        if let dict = value as? [String: Any], dict["__bduiExpr"] as? Bool == true {
            return dict["code"] as? String
        }
        if let string = value as? String {
            return wholeExpressionCode(string) ?? string
        }
        return nil
    }

    private static func wholeExpressionCode(_ string: String) -> String? {
        let trimmed = string.trimmingCharacters(in: .whitespacesAndNewlines)
        guard trimmed.hasPrefix("{{"), trimmed.hasSuffix("}}") else { return nil }
        return String(trimmed.dropFirst(2).dropLast(2)).trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private static func replaceExpressions(in string: String, transform: (String) -> String) -> String {
        var output = ""
        var rest = string[...]
        while let start = rest.range(of: "{{"), let end = rest[start.upperBound...].range(of: "}}") {
            output += String(rest[..<start.lowerBound])
            output += transform(String(rest[start.upperBound..<end.lowerBound]))
            rest = rest[end.upperBound...]
        }
        output += String(rest)
        return output
    }
}
