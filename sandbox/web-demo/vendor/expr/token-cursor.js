import { ExpressionError } from '@bdui/core';
import { FORBIDDEN_IDENTIFIERS } from './limits.js';
export function peek(state) {
    const t = state.tokens[state.index];
    if (!t)
        throw new ExpressionError('Unexpected end of input');
    return t;
}
export function consume(state) {
    const t = peek(state);
    state.index++;
    return t;
}
export function match(state, type, value) {
    const t = peek(state);
    if (t.type !== type)
        return false;
    if (value !== undefined && t.value !== value)
        return false;
    return true;
}
export function expect(state, type, value) {
    if (!match(state, type, value)) {
        const t = peek(state);
        const want = value ?? type;
        throw new ExpressionError(`Expected "${want}" but got "${t.value}" (${t.type}) at position ${t.position}`, { position: t.position, expected: want, actualType: t.type, actualValue: t.value });
    }
    return consume(state);
}
export function assertIdentAllowed(name, position) {
    if (FORBIDDEN_IDENTIFIERS.includes(name)) {
        throw new ExpressionError(`Identifier "${name}" is not allowed`, { position, name });
    }
}
//# sourceMappingURL=token-cursor.js.map