import { normalizeActions } from '../actions-normalize.js';
import { toJsonValue } from '../expr.js';
import { isStateVar } from '../state.js';
/** Serialise a prop value: handle StateVar → Binding, ExprRef → {{...}}, etc. */
function normalisePropValue(value) {
    if (isStateVar(value)) {
        return { scope: value.scope, path: value.path };
    }
    if (Array.isArray(value)) {
        return value.map(normalisePropValue);
    }
    if (value && typeof value === 'object' && !value.__bduiExpr) {
        const record = value;
        const out = {};
        for (const [k, v] of Object.entries(record)) {
            if (v === undefined)
                continue;
            out[k] = normalisePropValue(v);
        }
        return out;
    }
    return toJsonValue(value);
}
export function createNode(type, props, cfg) {
    const src = props ?? {};
    const { children, ...rest } = src;
    const remapped = {};
    for (const [rawKey, rawValue] of Object.entries(rest)) {
        const actualKey = cfg.aliases?.[rawKey] ?? rawKey;
        if (rawValue === undefined)
            continue;
        if (cfg.events && cfg.events.includes(actualKey)) {
            remapped[actualKey] = normalizeActions(rawValue);
        }
        else {
            remapped[actualKey] = normalisePropValue(rawValue);
        }
    }
    if (cfg.children === 'text') {
        if (children !== undefined) {
            const toText = (c) => {
                const value = toJsonValue(c);
                return value == null ? '' : String(value);
            };
            const textValue = Array.isArray(children)
                ? children.flat().map(toText).join('')
                : toText(children);
            remapped[cfg.mapToProp ?? 'text'] = textValue;
        }
        return { type, ...remapped };
    }
    const node = { type, ...remapped };
    if ((cfg.children === 'nodes' || cfg.children === 'slots') && children !== undefined) {
        const list = Array.isArray(children) ? children.flat() : [children];
        node.children = list.filter((v) => v != null && v !== false);
    }
    return node;
}
//# sourceMappingURL=runtime.js.map