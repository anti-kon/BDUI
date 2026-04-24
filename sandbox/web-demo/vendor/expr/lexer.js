import { ExpressionError } from '@bdui/core';
const PUNCT_TWO = new Set(['==', '!=', '<=', '>=', '&&', '||', '??']);
const PUNCT_ONE = new Set([
    '+',
    '-',
    '*',
    '/',
    '%',
    '!',
    '<',
    '>',
    '(',
    ')',
    '[',
    ']',
    '{',
    '}',
    ',',
    '.',
    ':',
    '?',
]);
function isDigit(ch) {
    return ch >= '0' && ch <= '9';
}
function isIdentStart(ch) {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_' || ch === '$';
}
function isIdentPart(ch) {
    return isIdentStart(ch) || isDigit(ch);
}
export function tokenize(source) {
    const tokens = [];
    let i = 0;
    const len = source.length;
    while (i < len) {
        const ch = source.charAt(i);
        if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
            i++;
            continue;
        }
        if (isDigit(ch) || (ch === '.' && isDigit(source.charAt(i + 1)))) {
            const start = i;
            while (i < len && isDigit(source.charAt(i)))
                i++;
            if (source.charAt(i) === '.') {
                i++;
                while (i < len && isDigit(source.charAt(i)))
                    i++;
            }
            if (source.charAt(i) === 'e' || source.charAt(i) === 'E') {
                i++;
                if (source.charAt(i) === '+' || source.charAt(i) === '-')
                    i++;
                while (i < len && isDigit(source.charAt(i)))
                    i++;
            }
            tokens.push({ type: 'number', value: source.slice(start, i), position: start });
            continue;
        }
        if (ch === "'" || ch === '"') {
            const quote = ch;
            const start = i;
            i++;
            let out = '';
            while (i < len && source.charAt(i) !== quote) {
                const c = source.charAt(i);
                if (c === '\\') {
                    const next = source.charAt(i + 1);
                    if (next === 'n')
                        out += '\n';
                    else if (next === 't')
                        out += '\t';
                    else if (next === 'r')
                        out += '\r';
                    else if (next === '\\')
                        out += '\\';
                    else if (next === "'")
                        out += "'";
                    else if (next === '"')
                        out += '"';
                    else
                        out += next;
                    i += 2;
                }
                else {
                    out += c;
                    i++;
                }
            }
            if (i >= len) {
                throw new ExpressionError(`Unterminated string at position ${start}`, {
                    position: start,
                });
            }
            i++;
            tokens.push({ type: 'string', value: out, position: start });
            continue;
        }
        if (isIdentStart(ch)) {
            const start = i;
            while (i < len && isIdentPart(source.charAt(i)))
                i++;
            tokens.push({ type: 'identifier', value: source.slice(start, i), position: start });
            continue;
        }
        const two = source.slice(i, i + 2);
        if (PUNCT_TWO.has(two)) {
            tokens.push({ type: 'punct', value: two, position: i });
            i += 2;
            continue;
        }
        if (PUNCT_ONE.has(ch)) {
            tokens.push({ type: 'punct', value: ch, position: i });
            i++;
            continue;
        }
        throw new ExpressionError(`Unexpected character "${ch}" at position ${i}`, {
            position: i,
            char: ch,
        });
    }
    tokens.push({ type: 'eof', value: '', position: i });
    return tokens;
}
//# sourceMappingURL=lexer.js.map