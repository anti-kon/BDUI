export function cssForModifiers(modifiers) {
    if (!modifiers)
        return {};
    const style = {};
    for (const [key, value] of Object.entries(modifiers)) {
        if (value == null)
            continue;
        switch (key) {
            case 'padding':
            case 'gap':
            case 'width':
            case 'height':
            case 'margin':
                style[key] = typeof value === 'number' ? `${value}px` : String(value);
                break;
            case 'align':
                style.alignItems = String(value);
                break;
            case 'justify':
                style.justifyContent = String(value);
                break;
            default:
                style[key] = String(value);
        }
    }
    return style;
}
export function renderUnsupported(doc, node) {
    const el = doc.createElement('pre');
    el.textContent = '[Unsupported node]\n' + JSON.stringify(node, null, 2);
    el.style.color = '#991b1b';
    el.style.background = '#fef2f2';
    el.style.padding = '8px';
    el.style.borderRadius = '4px';
    return el;
}
export function formatValue(value) {
    return value == null ? '' : String(value);
}
//# sourceMappingURL=dom-utils.js.map