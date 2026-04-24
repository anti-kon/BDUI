export function isNodeBase(value) {
    return (typeof value === 'object' &&
        value !== null &&
        typeof value.type === 'string');
}
//# sourceMappingURL=node.js.map