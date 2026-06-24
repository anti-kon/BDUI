import { ExpressionError } from '@bdui/core';
const FORBIDDEN_PROPERTIES = new Set(['__proto__', 'prototype', 'constructor']);
/**
 * Read a property from a value while blocking prototype-pollution vectors.
 * Strings and arrays expose `length` plus integer indexing; plain objects fall
 * back to a direct key lookup.
 */
export function safeGetProperty(obj, key) {
    if (obj == null)
        return undefined;
    if (FORBIDDEN_PROPERTIES.has(key)) {
        throw new ExpressionError(`Access to property "${key}" is forbidden`);
    }
    if (typeof obj === 'string') {
        if (key === 'length')
            return obj.length;
        const idx = Number(key);
        if (Number.isInteger(idx) && idx >= 0 && idx < obj.length)
            return obj.charAt(idx);
        return undefined;
    }
    if (Array.isArray(obj)) {
        if (key === 'length')
            return obj.length;
        const idx = Number(key);
        if (Number.isInteger(idx) && idx >= 0 && idx < obj.length)
            return obj[idx];
        return undefined;
    }
    if (typeof obj === 'object') {
        return obj[key];
    }
    return undefined;
}
//# sourceMappingURL=property-access.js.map