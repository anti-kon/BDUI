import SwiftUI
import UIKit

struct BDUIRenderer: View {
    @ObservedObject var runtime: BDUIRuntime

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                routeView
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(BDUIStyle.themeColor("bg", runtime: runtime) ?? Color(.systemGroupedBackground))
        .tint(BDUIStyle.themeColor("primary", runtime: runtime) ?? .accentColor)
        .scrollDismissesKeyboard(.interactively)
        .alert(
            "BDUI",
            isPresented: Binding(
                get: { runtime.toastMessage != nil },
                set: { if !$0 { runtime.toastMessage = nil } }
            )
        ) {
            Button("OK", role: .cancel) { runtime.toastMessage = nil }
        } message: {
            Text(runtime.toastMessage ?? "")
        }
    }

    @ViewBuilder
    private var routeView: some View {
        if let route = runtime.currentRouteObject {
            if route["type"] as? String == "flow" {
                if let step = runtime.currentFlowStep(in: route) {
                    BDUIChildrenView(children: step["children"] as? [[String: Any]], runtime: runtime)
                }
            } else if let node = route["node"] as? [String: Any] {
                BDUINodeView(node: node, runtime: runtime)
            }
        } else {
            Text("Route not found: \(runtime.currentRoute)")
                .padding(20)
        }
    }
}

struct BDUIChildrenView: View {
    let children: [[String: Any]]?
    @ObservedObject var runtime: BDUIRuntime

    var body: some View {
        ForEach(Array((children ?? []).enumerated()), id: \.offset) { _, child in
            BDUINodeView(node: child, runtime: runtime)
        }
    }
}

struct BDUINodeView: View {
    let node: [String: Any]
    @ObservedObject var runtime: BDUIRuntime

    var body: some View {
        switch node["type"] as? String {
        case "Column":
            columnView
        case "Row":
            rowView
        case "Text":
            styledText
        case "Button":
            buttonView
        case "Input":
            inputView
        case "Checkbox":
            checkboxView
        case "Image":
            imageView
        case "Select":
            selectView
        case "If":
            if BDUIExpression.evalBool(node["condition"], runtime: runtime) {
                BDUIChildrenView(children: node["children"] as? [[String: Any]], runtime: runtime)
            }
        case "Divider":
            Divider().padding(.vertical, 4)
        default:
            Text("Unsupported node: \(node["type"] as? String ?? "unknown")")
                .foregroundColor(.secondary)
        }
    }

    private var modifiers: [String: Any]? {
        node["modifiers"] as? [String: Any]
    }

    private var spacing: CGFloat {
        BDUIStyle.dimension(modifiers?["gap"], defaultValue: 10)
    }

    @ViewBuilder
    private var columnView: some View {
        VStack(alignment: BDUIStyle.horizontalAlignment(modifiers), spacing: spacing) {
            BDUIChildrenView(children: node["children"] as? [[String: Any]], runtime: runtime)
        }
        .frame(maxWidth: .infinity, alignment: BDUIStyle.frameAlignment(modifiers))
        .bduiContainer(modifiers)
    }

    @ViewBuilder
    private var rowView: some View {
        if modifiers?["flexWrap"] as? String == "wrap" {
            BDUIFlowLayout(spacing: spacing) {
                BDUIChildrenView(children: node["children"] as? [[String: Any]], runtime: runtime)
            }
            .frame(maxWidth: .infinity, alignment: BDUIStyle.frameAlignment(modifiers))
            .bduiContainer(modifiers)
        } else {
            HStack(alignment: BDUIStyle.verticalAlignment(modifiers), spacing: spacing) {
                BDUIChildrenView(children: node["children"] as? [[String: Any]], runtime: runtime)
            }
            .frame(maxWidth: .infinity, alignment: BDUIStyle.frameAlignment(modifiers))
            .bduiContainer(modifiers)
        }
    }

    @ViewBuilder
    private var styledText: some View {
        let text = BDUIExpression.interpolate(node["text"] ?? node["value"], runtime: runtime)
        Text(text)
            .font(BDUIStyle.font(modifiers))
            .foregroundColor(BDUIStyle.color(modifiers?["color"]) ?? .primary)
            .fixedSize(horizontal: false, vertical: true)
            .bduiContainer(modifiers)
    }

    @ViewBuilder
    private var buttonView: some View {
        let title = BDUIExpression.interpolate(node["title"], runtime: runtime)
        let primary = modifiers?["variant"] as? String == "primary" || node["variant"] as? String == "primary"
        let foreground = BDUIStyle.color(modifiers?["color"]) ?? (primary ? .white : .primary)
        let background = BDUIStyle.color(modifiers?["background"]) ?? (primary ? .accentColor : .clear)
        let border = BDUIStyle.border(modifiers?["border"]) ?? (primary ? nil : (Color.secondary.opacity(0.35), CGFloat(1)))
        let radius = BDUIStyle.dimension(modifiers?["borderRadius"], defaultValue: primary ? 12 : 10)
        let minHeight = BDUIStyle.dimension(modifiers?["minHeight"], defaultValue: 36)
        let padding = BDUIStyle.padding(modifiers?["padding"], defaultValue: EdgeInsets(top: 8, leading: 14, bottom: 8, trailing: 14))

        Button {
            runtime.run(actions: node["onAction"])
        } label: {
            Text(title)
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(foreground)
                .lineLimit(nil)
                .fixedSize(horizontal: false, vertical: true)
                .padding(padding)
                .frame(minHeight: minHeight)
                .background(RoundedRectangle(cornerRadius: radius, style: .continuous).fill(background))
                .overlay {
                    if let border {
                        RoundedRectangle(cornerRadius: radius, style: .continuous)
                            .stroke(border.0, lineWidth: border.1)
                    }
                }
        }
        .buttonStyle(.plain)
    }

    @ViewBuilder
    private var inputView: some View {
        TextField(
            BDUIExpression.interpolate(node["placeholder"], runtime: runtime),
            text: runtime.stringBinding(node["binding"] as? [String: Any])
        )
        .keyboardType(BDUIStyle.keyboardType(node["inputType"] as? String))
        .textFieldStyle(.roundedBorder)
        .padding(.vertical, 2)
    }

    @ViewBuilder
    private var checkboxView: some View {
        Toggle(
            BDUIExpression.interpolate(node["label"], runtime: runtime),
            isOn: runtime.boolBinding(node["binding"] as? [String: Any])
        )
        .toggleStyle(.switch)
    }

    @ViewBuilder
    private var imageView: some View {
        let label = BDUIExpression.interpolate(node["alt"] ?? node["src"], runtime: runtime)
        let source = BDUIExpression.interpolate(node["src"], runtime: runtime)
        let width = BDUIStyle.optionalDimension(node["width"])
        let height = BDUIStyle.optionalDimension(node["height"]) ?? 44
        let fullWidth = BDUIStyle.isFullWidth(node["width"])
        let radius = BDUIStyle.dimension(modifiers?["borderRadius"], defaultValue: 12)
        let background = BDUIStyle.color(modifiers?["background"]) ?? Color.accentColor.opacity(0.14)
        let border = BDUIStyle.border(modifiers?["border"])
        let shape = RoundedRectangle(cornerRadius: radius, style: .continuous)

        Group {
            if let image = BDUIImageLoader.image(named: source) {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: (node["fit"] as? String) == "cover" ? .fill : .fit)
            } else {
                ZStack {
                    shape.fill(background)
                    Text(String((label.isEmpty ? "Image" : label).prefix(2)).uppercased())
                        .font(.caption.bold())
                        .foregroundColor(.accentColor)
                }
            }
        }
        .frame(width: fullWidth ? nil : width, height: height)
        .frame(maxWidth: fullWidth ? .infinity : nil)
        .background(shape.fill(background))
        .clipShape(shape)
        .overlay {
            if let border {
                shape.stroke(border.0, lineWidth: border.1)
            }
        }
        .accessibilityLabel(Text(label.isEmpty ? "Image" : label))
    }

    @ViewBuilder
    private var selectView: some View {
        let binding = node["binding"] as? [String: Any]
        let options = node["options"] as? [[String: Any]] ?? []
        Picker(
            BDUIExpression.interpolate(node["placeholder"], runtime: runtime),
            selection: runtime.stringBinding(binding)
        ) {
            ForEach(Array(options.enumerated()), id: \.offset) { _, option in
                let value = option["value"].map { "\($0)" } ?? ""
                Text(BDUIExpression.interpolate(option["label"], runtime: runtime)).tag(value)
            }
        }
        .pickerStyle(.menu)
        .onChange(of: runtime.stringBinding(binding).wrappedValue) { _ in
            runtime.run(actions: node["onChangeAction"])
        }
    }
}

struct BDUIFlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        arrange(in: proposal.width ?? UIScreen.main.bounds.width - 32, subviews: subviews).size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let arranged = arrange(in: bounds.width, subviews: subviews)
        for item in arranged.items {
            subviews[item.index].place(
                at: CGPoint(x: bounds.minX + item.origin.x, y: bounds.minY + item.origin.y),
                proposal: ProposedViewSize(item.size)
            )
        }
    }

    private func arrange(in width: CGFloat, subviews: Subviews) -> (items: [(index: Int, size: CGSize, origin: CGPoint)], size: CGSize) {
        let maxWidth = max(width, 1)
        var items: [(index: Int, size: CGSize, origin: CGPoint)] = []
        var cursor = CGPoint.zero
        var rowHeight: CGFloat = 0
        var usedWidth: CGFloat = 0

        for (index, subview) in subviews.enumerated() {
            var size = subview.sizeThatFits(.unspecified)
            size.width = min(size.width, maxWidth)
            if cursor.x > 0, cursor.x + size.width > maxWidth {
                cursor.x = 0
                cursor.y += rowHeight + spacing
                rowHeight = 0
            }
            items.append((index, size, cursor))
            cursor.x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
            usedWidth = max(usedWidth, cursor.x - spacing)
        }

        return (items, CGSize(width: usedWidth, height: cursor.y + rowHeight))
    }
}

private struct BDUIContainerModifier: ViewModifier {
    let modifiers: [String: Any]?
    let includePadding: Bool

    func body(content: Content) -> some View {
        let radius = BDUIStyle.dimension(modifiers?["borderRadius"], defaultValue: 0)
        let background = BDUIStyle.color(modifiers?["background"])
        let border = BDUIStyle.border(modifiers?["border"])
        let insets = includePadding ? BDUIStyle.padding(modifiers?["padding"]) : BDUIStyle.zeroInsets
        let shape = RoundedRectangle(cornerRadius: radius, style: .continuous)

        content
            .padding(insets)
            .background {
                if let background {
                    shape.fill(background)
                }
            }
            .overlay {
                if let border {
                    shape.stroke(border.0, lineWidth: border.1)
                }
            }
            .clipShape(radius > 0 ? AnyShape(shape) : AnyShape(Rectangle()))
    }
}

private extension View {
    func bduiContainer(_ modifiers: [String: Any]?, includePadding: Bool = true) -> some View {
        modifier(BDUIContainerModifier(modifiers: modifiers, includePadding: includePadding))
    }
}

private struct AnyShape: Shape {
    private let pathBuilder: (CGRect) -> Path

    init<S: Shape>(_ shape: S) {
        pathBuilder = { rect in shape.path(in: rect) }
    }

    func path(in rect: CGRect) -> Path {
        pathBuilder(rect)
    }
}

private enum BDUIImageLoader {
    static func image(named source: String) -> UIImage? {
        let normalized = source.replacingOccurrences(of: "\\", with: "/")
        let ns = normalized as NSString
        let fileName = ns.lastPathComponent
        let ext = (fileName as NSString).pathExtension
        let base = (fileName as NSString).deletingPathExtension
        let subdirectory = ns.deletingLastPathComponent
        let resourceExt = ext.isEmpty ? nil : ext

        if !subdirectory.isEmpty, subdirectory != ".",
           let url = Bundle.main.url(forResource: base, withExtension: resourceExt, subdirectory: subdirectory),
           let image = UIImage(contentsOfFile: url.path) {
            return image
        }
        if let url = Bundle.main.url(forResource: base, withExtension: resourceExt),
           let image = UIImage(contentsOfFile: url.path) {
            return image
        }
        return UIImage(named: normalized) ?? UIImage(named: fileName) ?? UIImage(named: base)
    }
}

private enum BDUIStyle {
    static let zeroInsets = EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0)

    static func themeColor(_ key: String, runtime: BDUIRuntime) -> Color? {
        let theme = runtime.contract["theme"] as? [String: Any]
        let palette = theme?["palette"] as? [String: Any]
        let light = palette?["light"] as? [String: Any]
        return color(light?[key])
    }

    static func font(_ modifiers: [String: Any]?) -> Font {
        let role = modifiers?["role"] as? String
        let design: Font.Design = ((modifiers?["fontFamily"] as? String)?.lowercased().contains("mono") == true) ? .monospaced : .default
        if let size = optionalDimension(modifiers?["fontSize"]) {
            return .system(size: size, weight: fontWeight(modifiers?["fontWeight"]), design: design)
        }
        switch role {
        case "title":
            return .title.weight(.bold)
        case "section":
            return .headline
        case "muted":
            return .subheadline
        default:
            return .system(.body, design: design).weight(fontWeight(modifiers?["fontWeight"]))
        }
    }

    static func fontWeight(_ raw: Any?) -> Font.Weight {
        let value: Int
        if let number = raw as? NSNumber {
            value = number.intValue
        } else if let string = raw as? String, let parsed = Int(string) {
            value = parsed
        } else {
            return .regular
        }
        switch value {
        case 900...: return .black
        case 800..<900: return .heavy
        case 700..<800: return .bold
        case 600..<700: return .semibold
        case 500..<600: return .medium
        default: return .regular
        }
    }

    static func horizontalAlignment(_ modifiers: [String: Any]?) -> HorizontalAlignment {
        switch modifiers?["alignItems"] as? String {
        case "center": return .center
        case "flex-end", "end": return .trailing
        default: return .leading
        }
    }

    static func verticalAlignment(_ modifiers: [String: Any]?) -> VerticalAlignment {
        switch modifiers?["alignItems"] as? String {
        case "center": return .center
        case "flex-end", "end": return .bottom
        default: return .top
        }
    }

    static func frameAlignment(_ modifiers: [String: Any]?) -> Alignment {
        switch modifiers?["justifyContent"] as? String {
        case "center": return .center
        case "flex-end", "end": return .trailing
        default: return .leading
        }
    }

    static func keyboardType(_ raw: String?) -> UIKeyboardType {
        switch raw {
        case "number": return .numberPad
        case "email": return .emailAddress
        case "tel", "phone": return .phonePad
        default: return .default
        }
    }

    static func isFullWidth(_ raw: Any?) -> Bool {
        (raw as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) == "100%"
    }

    static func optionalDimension(_ raw: Any?) -> CGFloat? {
        if let number = raw as? NSNumber { return CGFloat(truncating: number) }
        if let number = raw as? Double { return CGFloat(number) }
        if let number = raw as? Int { return CGFloat(number) }
        if let string = raw as? String {
            let normalized = string
                .trimmingCharacters(in: .whitespacesAndNewlines)
                .replacingOccurrences(of: "px", with: "")
            if normalized.hasSuffix("%") { return nil }
            return Double(normalized).map(CGFloat.init)
        }
        return nil
    }

    static func dimension(_ raw: Any?, defaultValue: CGFloat) -> CGFloat {
        optionalDimension(raw) ?? defaultValue
    }

    static func padding(_ raw: Any?, defaultValue: EdgeInsets = zeroInsets) -> EdgeInsets {
        guard let raw else { return defaultValue }
        let values: [CGFloat]
        if let number = raw as? NSNumber {
            values = [CGFloat(truncating: number)]
        } else if let string = raw as? String {
            values = string
                .split(whereSeparator: { $0.isWhitespace })
                .compactMap { optionalDimension(String($0)) }
        } else {
            return defaultValue
        }

        switch values.count {
        case 1:
            return EdgeInsets(top: values[0], leading: values[0], bottom: values[0], trailing: values[0])
        case 2:
            return EdgeInsets(top: values[0], leading: values[1], bottom: values[0], trailing: values[1])
        case 3:
            return EdgeInsets(top: values[0], leading: values[1], bottom: values[2], trailing: values[1])
        case 4...:
            return EdgeInsets(top: values[0], leading: values[3], bottom: values[2], trailing: values[1])
        default:
            return defaultValue
        }
    }

    static func border(_ raw: Any?) -> (Color, CGFloat)? {
        guard let string = raw as? String, !string.isEmpty else { return nil }
        let width = firstMatch(#"(\d+(?:\.\d+)?)px"#, in: string).flatMap { Double($0) }.map(CGFloat.init) ?? 1
        let colorToken = firstMatch(#"(#[0-9A-Fa-f]{6,8}|rgba?\([^)]+\))"#, in: string)
        guard let color = color(colorToken) else { return nil }
        return (color, width)
    }

    static func color(_ raw: Any?) -> Color? {
        guard let string = raw as? String else { return nil }
        let value = string.trimmingCharacters(in: .whitespacesAndNewlines)
        if value == "transparent" { return .clear }
        if value.hasPrefix("rgb") {
            let body = value
                .replacingOccurrences(of: "rgba(", with: "")
                .replacingOccurrences(of: "rgb(", with: "")
                .replacingOccurrences(of: ")", with: "")
            let parts = body.split(separator: ",").map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            guard parts.count >= 3,
                  let red = Double(parts[0]),
                  let green = Double(parts[1]),
                  let blue = Double(parts[2]) else {
                return nil
            }
            let alpha = parts.count >= 4 ? Double(parts[3]) ?? 1 : 1
            return Color(red: red / 255, green: green / 255, blue: blue / 255, opacity: alpha)
        }
        guard value.hasPrefix("#") else { return nil }
        var hex = String(value.dropFirst())
        if hex.count == 3 {
            hex = hex.map { "\($0)\($0)" }.joined()
        }
        guard hex.count == 6 || hex.count == 8, let int = UInt64(hex, radix: 16) else { return nil }
        let red: Double
        let green: Double
        let blue: Double
        let alpha: Double
        if hex.count == 8 {
            red = Double((int >> 24) & 0xff) / 255
            green = Double((int >> 16) & 0xff) / 255
            blue = Double((int >> 8) & 0xff) / 255
            alpha = Double(int & 0xff) / 255
        } else {
            red = Double((int >> 16) & 0xff) / 255
            green = Double((int >> 8) & 0xff) / 255
            blue = Double(int & 0xff) / 255
            alpha = 1
        }
        return Color(red: red, green: green, blue: blue, opacity: alpha)
    }

    private static func firstMatch(_ pattern: String, in string: String) -> String? {
        guard let regex = try? NSRegularExpression(pattern: pattern) else { return nil }
        let range = NSRange(string.startIndex..<string.endIndex, in: string)
        guard let match = regex.firstMatch(in: string, range: range),
              let matchRange = Range(match.range(at: 1), in: string) else {
            return nil
        }
        return String(string[matchRange])
    }
}
