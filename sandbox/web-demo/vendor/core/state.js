export const SCOPES = ['local', 'session', 'flow'];
export function isScope(value) {
    return typeof value === 'string' && SCOPES.includes(value);
}
//# sourceMappingURL=state.js.map