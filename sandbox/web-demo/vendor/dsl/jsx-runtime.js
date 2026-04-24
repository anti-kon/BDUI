export const Fragment = (props) => props.children ?? [];
function cleanProps(obj) {
    if (!obj)
        return {};
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined)
            out[k] = v;
    }
    return out;
}
export function jsx(type, props, key) {
    if (typeof type === 'function') {
        const merged = cleanProps({ ...(props ?? {}), key });
        return type(merged);
    }
    throw new Error(`Unsupported JSX element type: "${String(type)}". Only function components are allowed.`);
}
export const jsxs = jsx;
export const jsxDEV = jsx;
//# sourceMappingURL=jsx-runtime.js.map