import SwiftUI

struct BDUIRenderer: View {
    @ObservedObject var runtime: BDUIRuntime

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                routeView
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(Color(.systemGroupedBackground))
        .alert(
            "Кампус",
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
            VStack(alignment: .leading, spacing: spacing) {
                BDUIChildrenView(children: node["children"] as? [[String: Any]], runtime: runtime)
            }
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
        case "Row":
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: spacing) {
                    BDUIChildrenView(children: node["children"] as? [[String: Any]], runtime: runtime)
                }
                .padding(padding)
            }
        case "Text":
            styledText
        case "Button":
            buttonView
        case "Input":
            TextField(
                BDUIExpression.interpolate(node["placeholder"], runtime: runtime),
                text: runtime.stringBinding(node["binding"] as? [String: Any])
            )
            .keyboardType((node["inputType"] as? String) == "number" ? .numberPad : .default)
            .textFieldStyle(.roundedBorder)
            .padding(.vertical, 2)
        case "Checkbox":
            Toggle(
                BDUIExpression.interpolate(node["label"], runtime: runtime),
                isOn: runtime.boolBinding(node["binding"] as? [String: Any])
            )
            .toggleStyle(.switch)
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
                .foregroundStyle(.secondary)
        }
    }

    private var spacing: CGFloat {
        let modifiers = node["modifiers"] as? [String: Any]
        return CGFloat(BDUIExpression.asDouble(modifiers?["gap"], defaultValue: 10))
    }

    private var padding: CGFloat {
        let modifiers = node["modifiers"] as? [String: Any]
        return CGFloat(BDUIExpression.asDouble(modifiers?["padding"], defaultValue: 0))
    }

    @ViewBuilder
    private var styledText: some View {
        let text = BDUIExpression.interpolate(node["text"] ?? node["value"], runtime: runtime)
        let role = (node["modifiers"] as? [String: Any])?["role"] as? String
        switch role {
        case "title":
            Text(text).font(.title.bold())
        case "section":
            Text(text).font(.headline)
        case "muted":
            Text(text).font(.subheadline).foregroundStyle(.secondary)
        case "success":
            Text(text).foregroundStyle(.green)
        default:
            Text(text).font(.body)
        }
    }

    @ViewBuilder
    private var buttonView: some View {
        let title = BDUIExpression.interpolate(node["title"], runtime: runtime)
        let variant = (node["modifiers"] as? [String: Any])?["variant"] as? String
            ?? node["variant"] as? String
        if variant == "primary" {
            Button(title) { runtime.run(actions: node["onAction"]) }
                .buttonStyle(.borderedProminent)
        } else {
            Button(title) { runtime.run(actions: node["onAction"]) }
                .buttonStyle(.bordered)
        }
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
