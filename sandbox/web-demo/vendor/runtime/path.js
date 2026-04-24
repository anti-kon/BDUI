/** Deep immutable get by dot-path. */
export function deepGet(obj, path) {
    if (!path)
        return obj;
    if (obj === null || typeof obj !== 'object')
        return undefined;
    const parts = path.split('.').filter(Boolean);
    let current = obj;
    for (const key of parts) {
        if (current === null || typeof current !== 'object')
            return undefined;
        current = current[key];
    }
    return current;
}
/**
 * Deep immutable set by dot-path. Returns a new root; leaves the rest of the
 * tree structurally shared with the input.
 */
export function deepSet(obj, path, value) {
    const parts = path.split('.').filter(Boolean);
    if (parts.length === 0)
        return obj;
    return assoc(obj, parts, 0, value);
}
function assoc(node, parts, index, value) {
    const key = parts[index];
    if (key === undefined)
        return value;
    const base = node !== null && typeof node === 'object' && !Array.isArray(node)
        ? { ...node }
        : {};
    base[key] = assoc(base[key], parts, index + 1, value);
    return base;
}
/** Delete a dot-path (returns a new root). */
export function deepDelete(obj, path) {
    const parts = path.split('.').filter(Boolean);
    if (parts.length === 0)
        return obj;
    return dissoc(obj, parts, 0);
}
function dissoc(node, parts, index) {
    if (node === null || typeof node !== 'object')
        return node;
    const key = parts[index];
    if (key === undefined)
        return node;
    const clone = { ...node };
    if (index === parts.length - 1) {
        delete clone[key];
        return clone;
    }
    clone[key] = dissoc(clone[key], parts, index + 1);
    return clone;
}
//# sourceMappingURL=path.js.map