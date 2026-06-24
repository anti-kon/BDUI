import { exprRef, isExprRef } from '@bdui/core';
import { isStateVar } from './state.js';
const SCOPES = ['local', 'session', 'flow'];
function isScope(v) {
    return typeof v === 'string' && SCOPES.includes(v);
}
function ensurePath(path) {
    if (typeof path !== 'string' || !path.trim()) {
        throw new Error('Target path must be a non-empty string');
    }
    return path;
}
export function parseTarget(target) {
    if (typeof target === 'string') {
        const idx = target.indexOf('.');
        if (idx < 0)
            throw new Error(`Invalid string target: "${target}"`);
        const scope = target.slice(0, idx);
        const path = target.slice(idx + 1);
        if (!isScope(scope))
            throw new Error(`Unsupported scope: "${scope}"`);
        return { scope, path: ensurePath(path) };
    }
    if (isStateVar(target)) {
        return { scope: target.scope, path: target.path };
    }
    const scope = target.scope;
    const path = target.path;
    if (!isScope(scope))
        throw new Error(`Unsupported scope: "${String(scope)}"`);
    return { scope, path: ensurePath(path) };
}
export function ensureExprRef(value) {
    if (isExprRef(value))
        return value;
    if (typeof value === 'string')
        return exprRef(value);
    throw new Error('Expected an expression reference or a string expression');
}
//# sourceMappingURL=target.js.map