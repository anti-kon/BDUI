export const DEFAULT_LIMITS = {
    maxSourceLength: 1024,
    maxDepth: 32,
    maxNodes: 256,
};
/** Identifiers explicitly forbidden to prevent prototype pollution. */
export const FORBIDDEN_IDENTIFIERS = Object.freeze([
    '__proto__',
    'prototype',
    'constructor',
    'this',
    'globalThis',
    'window',
    'self',
    'eval',
    'Function',
]);
//# sourceMappingURL=limits.js.map