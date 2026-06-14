const LENGTH_PROPS = new Set([
    'borderRadius',
    'bottom',
    'columnGap',
    'fontSize',
    'gap',
    'height',
    'left',
    'letterSpacing',
    'margin',
    'marginBottom',
    'marginLeft',
    'marginRight',
    'marginTop',
    'maxHeight',
    'maxWidth',
    'minHeight',
    'minWidth',
    'padding',
    'paddingBottom',
    'paddingLeft',
    'paddingRight',
    'paddingTop',
    'right',
    'rowGap',
    'top',
    'width',
]);
const NON_CSS_MODIFIERS = new Set(['accessibilityLabel', 'role', 'testId', 'variant']);
function cssValue(key, value, resolveValue) {
    const resolved = resolveValue ? resolveValue(value) : value;
    if (resolved == null)
        return undefined;
    if (key === 'lineHeight' && typeof resolved === 'number')
        return String(resolved);
    if (typeof resolved === 'number' && LENGTH_PROPS.has(key))
        return `${resolved}px`;
    return String(resolved);
}
function flexPosition(value) {
    switch (value) {
        case 'start':
            return 'flex-start';
        case 'end':
            return 'flex-end';
        case 'between':
            return 'space-between';
        case 'around':
            return 'space-around';
        default:
            return String(value);
    }
}
export function cssForModifiers(modifiers, resolveValue) {
    if (!modifiers)
        return {};
    const style = {};
    for (const [key, value] of Object.entries(modifiers)) {
        if (value == null)
            continue;
        if (key === 'style' && typeof value === 'object' && !Array.isArray(value)) {
            Object.assign(style, cssForModifiers(value, resolveValue));
            continue;
        }
        if (NON_CSS_MODIFIERS.has(key))
            continue;
        switch (key) {
            case 'align':
                style.alignItems = flexPosition(value);
                break;
            case 'justify':
                style.justifyContent = flexPosition(value);
                break;
            default: {
                const nextValue = cssValue(key, value, resolveValue);
                if (nextValue !== undefined)
                    style[key] = nextValue;
            }
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