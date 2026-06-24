import Foundation

/// Minimal expression evaluator mirroring the `@bdui/expr` semantics needed by
/// the native demos: interpolation, scalar lookup, arithmetic and boolean guards.
enum BDUIExpression {
    static func interpolate(_ value: Any?, runtime: BDUIRuntime) -> String {
        let resolved = resolve(value, runtime: runtime)
        guard let raw = resolved as? String else { return stringify(resolved) }
        return replaceExpressions(in: raw) { code in
            stringify(evalScalar(code, runtime: runtime))
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
        return splitTopLevel(code, delimiter: "||").contains { part in
            splitTopLevel(part, delimiter: "&&").allSatisfy { evalComparison($0, runtime: runtime) }
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
            if let range = topLevelRange(of: op, in: code) {
                let left = evalScalar(String(code[..<range.lowerBound]), runtime: runtime)
                let right = evalScalar(String(code[range.upperBound...]), runtime: runtime)
                return compare(left, right, op)
            }
        }
        return truthy(evalScalar(code, runtime: runtime))
    }

    private static func evalScalar(_ raw: String, runtime: BDUIRuntime) -> Any? {
        let code = stripOuterParens(raw.trimmingCharacters(in: .whitespacesAndNewlines))
        if code.isEmpty { return "" }
        if code == "true" { return true }
        if code == "false" { return false }
        if code == "null" { return nil }
        if (code.hasPrefix("'") && code.hasSuffix("'")) || (code.hasPrefix("\"") && code.hasSuffix("\"")) {
            return String(code.dropFirst().dropLast())
        }
        if let number = Double(code) { return number }
        if let call = parseCall(code) { return evalCall(name: call.name, args: call.args, runtime: runtime) }
        if let number = evalArithmetic(code, runtime: runtime) { return number }
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
        case "==": return stringify(left) == stringify(right) || (numeric && lnum == rnum)
        case "!=": return stringify(left) != stringify(right) && (!numeric || lnum != rnum)
        case ">": return numeric && lnum > rnum
        case "<": return numeric && lnum < rnum
        case ">=": return numeric && lnum >= rnum
        case "<=": return numeric && lnum <= rnum
        default: return false
        }
    }

    private static func evalCall(name: String, args: [String], runtime: BDUIRuntime) -> Any? {
        let values = args.map { evalScalar($0, runtime: runtime) }
        let first = values.first ?? nil
        switch name {
        case "len":
            return length(first)
        case "max":
            return values.map { asDouble($0, defaultValue: .nan) }.max()
        case "min":
            return values.map { asDouble($0, defaultValue: .nan) }.min()
        case "abs":
            return abs(asDouble(first, defaultValue: .nan))
        case "round":
            return round(asDouble(first, defaultValue: .nan))
        case "floor":
            return floor(asDouble(first, defaultValue: .nan))
        case "ceil":
            return ceil(asDouble(first, defaultValue: .nan))
        case "not":
            return !truthy(first)
        case "isEmpty":
            return length(first) == 0
        case "coalesce":
            return values.first { value in value != nil && !(value is NSNull) } ?? nil
        default:
            return nil
        }
    }

    private static func evalArithmetic(_ raw: String, runtime: BDUIRuntime) -> Double? {
        let code = stripOuterParens(raw)
        guard !code.isEmpty else { return nil }
        if let index = findTopLevelOperator(in: code, operators: Set<Character>(["+", "-"])) {
            let rightStart = code.index(after: index)
            let left = asDouble(evalScalar(String(code[..<index]), runtime: runtime), defaultValue: .nan)
            let right = asDouble(evalScalar(String(code[rightStart...]), runtime: runtime), defaultValue: .nan)
            return code[index] == "+" ? left + right : left - right
        }
        if let index = findTopLevelOperator(in: code, operators: Set<Character>(["*", "/", "%"])) {
            let rightStart = code.index(after: index)
            let left = asDouble(evalScalar(String(code[..<index]), runtime: runtime), defaultValue: .nan)
            let right = asDouble(evalScalar(String(code[rightStart...]), runtime: runtime), defaultValue: .nan)
            switch code[index] {
            case "*": return left * right
            case "/": return left / right
            default: return left.truncatingRemainder(dividingBy: right)
            }
        }
        return nil
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

    private static func parseCall(_ code: String) -> (name: String, args: [String])? {
        guard code.hasSuffix(")"), let open = code.firstIndex(of: "("), open > code.startIndex else {
            return nil
        }
        let name = String(code[..<open]).trimmingCharacters(in: .whitespacesAndNewlines)
        guard name.range(of: #"^[A-Za-z_][A-Za-z0-9_]*$"#, options: .regularExpression) != nil else {
            return nil
        }
        let suffix = String(code[open...])
        guard outerParensWrap(suffix) else { return nil }
        let body = String(code[code.index(after: open)..<code.index(before: code.endIndex)])
        return (name, splitArguments(body))
    }

    private static func splitArguments(_ code: String) -> [String] {
        if code.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { return [] }
        var out: [String] = []
        var depth = 0
        var quote: Character?
        var start = code.startIndex
        var index = code.startIndex
        while index < code.endIndex {
            let char = code[index]
            if let currentQuote = quote {
                if char == currentQuote { quote = nil }
            } else {
                switch char {
                case "'", "\"":
                    quote = char
                case "(":
                    depth += 1
                case ")":
                    depth -= 1
                case "," where depth == 0:
                    out.append(String(code[start..<index]).trimmingCharacters(in: .whitespacesAndNewlines))
                    start = code.index(after: index)
                default:
                    break
                }
            }
            index = code.index(after: index)
        }
        out.append(String(code[start...]).trimmingCharacters(in: .whitespacesAndNewlines))
        return out
    }

    private static func splitTopLevel(_ code: String, delimiter: String) -> [String] {
        var out: [String] = []
        var depth = 0
        var quote: Character?
        var start = code.startIndex
        var index = code.startIndex
        while index < code.endIndex {
            let char = code[index]
            if let currentQuote = quote {
                if char == currentQuote { quote = nil }
                index = code.index(after: index)
                continue
            }
            switch char {
            case "'", "\"":
                quote = char
            case "(":
                depth += 1
            case ")":
                depth -= 1
            default:
                if depth == 0, code[index...].hasPrefix(delimiter) {
                    out.append(String(code[start..<index]).trimmingCharacters(in: .whitespacesAndNewlines))
                    index = code.index(index, offsetBy: delimiter.count)
                    start = index
                    continue
                }
            }
            index = code.index(after: index)
        }
        out.append(String(code[start...]).trimmingCharacters(in: .whitespacesAndNewlines))
        return out.filter { !$0.isEmpty }
    }

    private static func topLevelRange(of op: String, in code: String) -> Range<String.Index>? {
        var depth = 0
        var quote: Character?
        var index = code.startIndex
        while index < code.endIndex {
            let char = code[index]
            if let currentQuote = quote {
                if char == currentQuote { quote = nil }
            } else {
                switch char {
                case "'", "\"":
                    quote = char
                case "(":
                    depth += 1
                case ")":
                    depth -= 1
                default:
                    if depth == 0, code[index...].hasPrefix(op) {
                        return index..<code.index(index, offsetBy: op.count)
                    }
                }
            }
            index = code.index(after: index)
        }
        return nil
    }

    private static func findTopLevelOperator(in code: String, operators: Set<Character>) -> String.Index? {
        guard !code.isEmpty else { return nil }
        var depth = 0
        var quote: Character?
        var index = code.index(before: code.endIndex)
        while true {
            let char = code[index]
            if let currentQuote = quote {
                if char == currentQuote { quote = nil }
            } else {
                switch char {
                case "'", "\"":
                    quote = char
                case ")":
                    depth += 1
                case "(":
                    depth -= 1
                default:
                    if depth == 0, operators.contains(char), !isUnarySign(in: code, at: index) {
                        return index
                    }
                }
            }
            if index == code.startIndex { break }
            index = code.index(before: index)
        }
        return nil
    }

    private static func isUnarySign(in code: String, at index: String.Index) -> Bool {
        let char = code[index]
        guard char == "-" || char == "+" else { return false }
        var previous = index
        while previous > code.startIndex {
            previous = code.index(before: previous)
            let value = code[previous]
            if value.isWhitespace { continue }
            return Set<Character>(["(", ",", "+", "-", "*", "/", "%"]).contains(value)
        }
        return true
    }

    private static func stripOuterParens(_ raw: String) -> String {
        var current = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        while current.hasPrefix("("), current.hasSuffix(")"), outerParensWrap(current) {
            current = String(current.dropFirst().dropLast()).trimmingCharacters(in: .whitespacesAndNewlines)
        }
        return current
    }

    private static func outerParensWrap(_ code: String) -> Bool {
        var depth = 0
        var quote: Character?
        var index = code.startIndex
        while index < code.endIndex {
            let char = code[index]
            if let currentQuote = quote {
                if char == currentQuote { quote = nil }
            } else {
                switch char {
                case "'", "\"":
                    quote = char
                case "(":
                    depth += 1
                case ")":
                    depth -= 1
                    if depth == 0, code.index(after: index) != code.endIndex { return false }
                default:
                    break
                }
            }
            index = code.index(after: index)
        }
        return depth == 0
    }

    private static func length(_ value: Any?) -> Int {
        if value == nil || value is NSNull { return 0 }
        if let string = value as? String { return string.count }
        if let array = value as? [Any] { return array.count }
        if let dict = value as? [String: Any] { return dict.count }
        return stringify(value).count
    }

    private static func stringify(_ value: Any?) -> String {
        if value == nil || value is NSNull { return "" }
        if let number = value as? NSNumber {
            let double = number.doubleValue
            if double.isFinite, double.truncatingRemainder(dividingBy: 1) == 0 {
                return String(Int64(double))
            }
        }
        if let double = value as? Double, double.isFinite, double.truncatingRemainder(dividingBy: 1) == 0 {
            return String(Int64(double))
        }
        return "\(value!)"
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
