import { ExpressionError } from '@bdui/core';
import { tokenize } from './lexer.js';
import { DEFAULT_LIMITS, FORBIDDEN_IDENTIFIERS } from './limits.js';
function peek(state) {
    const t = state.tokens[state.index];
    if (!t)
        throw new ExpressionError('Unexpected end of input');
    return t;
}
function consume(state) {
    const t = peek(state);
    state.index++;
    return t;
}
function match(state, type, value) {
    const t = peek(state);
    if (t.type !== type)
        return false;
    if (value !== undefined && t.value !== value)
        return false;
    return true;
}
function expect(state, type, value) {
    if (!match(state, type, value)) {
        const t = peek(state);
        const want = value ?? type;
        throw new ExpressionError(`Expected "${want}" but got "${t.value}" (${t.type}) at position ${t.position}`, { position: t.position, expected: want, actualType: t.type, actualValue: t.value });
    }
    return consume(state);
}
export function parse(source, limits = DEFAULT_LIMITS) {
    if (typeof source !== 'string') {
        throw new ExpressionError('Source must be a string');
    }
    if (source.length > limits.maxSourceLength) {
        throw new ExpressionError(`Source length (${source.length}) exceeds limit (${limits.maxSourceLength})`);
    }
    const tokens = tokenize(source);
    const state = { tokens, index: 0 };
    const node = parseTernary(state);
    if (!match(state, 'eof')) {
        const t = peek(state);
        throw new ExpressionError(`Unexpected token "${t.value}" at position ${t.position}`, {
            position: t.position,
        });
    }
    enforceLimits(node, limits);
    return node;
}
function enforceLimits(root, limits) {
    let count = 0;
    const walk = (node, depth) => {
        count++;
        if (count > limits.maxNodes) {
            throw new ExpressionError(`Expression node count exceeds limit (${limits.maxNodes})`);
        }
        if (depth > limits.maxDepth) {
            throw new ExpressionError(`Expression depth exceeds limit (${limits.maxDepth})`);
        }
        switch (node.kind) {
            case 'Array':
                for (const el of node.elements)
                    walk(el, depth + 1);
                return;
            case 'Object':
                for (const { value } of node.entries)
                    walk(value, depth + 1);
                return;
            case 'Member':
            case 'Index':
                walk(node.object, depth + 1);
                if (node.kind === 'Index')
                    walk(node.index, depth + 1);
                return;
            case 'Unary':
                walk(node.argument, depth + 1);
                return;
            case 'Binary':
            case 'Logical':
                walk(node.left, depth + 1);
                walk(node.right, depth + 1);
                return;
            case 'Ternary':
                walk(node.test, depth + 1);
                walk(node.consequent, depth + 1);
                walk(node.alternate, depth + 1);
                return;
            case 'Call':
                for (const a of node.args)
                    walk(a, depth + 1);
                return;
            default:
                return;
        }
    };
    walk(root, 0);
}
function parseTernary(state) {
    const test = parseNullishCoalescing(state);
    if (match(state, 'punct', '?')) {
        consume(state);
        const consequent = parseTernary(state);
        expect(state, 'punct', ':');
        const alternate = parseTernary(state);
        return { kind: 'Ternary', test, consequent, alternate };
    }
    return test;
}
function parseNullishCoalescing(state) {
    return parseLogicalLevel(state, ['??'], parseLogicalOr);
}
function parseLogicalOr(state) {
    return parseLogicalLevel(state, ['||'], parseLogicalAnd);
}
function parseLogicalAnd(state) {
    return parseLogicalLevel(state, ['&&'], parseEquality);
}
function parseLogicalLevel(state, ops, next) {
    let left = next(state);
    while (true) {
        const t = peek(state);
        if (t.type !== 'punct')
            break;
        const op = ops.find((o) => o === t.value);
        if (!op)
            break;
        consume(state);
        const right = next(state);
        left = { kind: 'Logical', op, left, right };
    }
    return left;
}
function parseEquality(state) {
    return parseBinaryLevel(state, ['==', '!='], parseComparison);
}
function parseComparison(state) {
    return parseBinaryLevel(state, ['<', '<=', '>', '>='], parseAdditive);
}
function parseAdditive(state) {
    return parseBinaryLevel(state, ['+', '-'], parseMultiplicative);
}
function parseMultiplicative(state) {
    return parseBinaryLevel(state, ['*', '/', '%'], parseUnary);
}
function parseBinaryLevel(state, ops, next) {
    let left = next(state);
    while (true) {
        const t = peek(state);
        if (t.type !== 'punct')
            break;
        const op = ops.find((o) => o === t.value);
        if (!op)
            break;
        consume(state);
        const right = next(state);
        left = { kind: 'Binary', op, left, right };
    }
    return left;
}
function parseUnary(state) {
    const t = peek(state);
    if (t.type === 'punct' && (t.value === '!' || t.value === '-' || t.value === '+')) {
        consume(state);
        const argument = parseUnary(state);
        return { kind: 'Unary', op: t.value, argument };
    }
    return parsePostfix(state);
}
function parsePostfix(state) {
    let node = parsePrimary(state);
    while (true) {
        if (match(state, 'punct', '.')) {
            consume(state);
            const ident = expect(state, 'identifier');
            assertIdentAllowed(ident.value, ident.position);
            node = { kind: 'Member', object: node, property: ident.value };
        }
        else if (match(state, 'punct', '[')) {
            consume(state);
            const index = parseTernary(state);
            expect(state, 'punct', ']');
            node = { kind: 'Index', object: node, index };
        }
        else {
            break;
        }
    }
    return node;
}
function parsePrimary(state) {
    const t = peek(state);
    if (t.type === 'number') {
        consume(state);
        const value = Number(t.value);
        if (!Number.isFinite(value)) {
            throw new ExpressionError(`Invalid number literal "${t.value}"`, {
                position: t.position,
            });
        }
        return { kind: 'Number', value };
    }
    if (t.type === 'string') {
        consume(state);
        return { kind: 'String', value: t.value };
    }
    if (t.type === 'identifier') {
        if (t.value === 'true' || t.value === 'false') {
            consume(state);
            return { kind: 'Bool', value: t.value === 'true' };
        }
        if (t.value === 'null' || t.value === 'undefined') {
            consume(state);
            return { kind: 'Null' };
        }
        assertIdentAllowed(t.value, t.position);
        consume(state);
        if (match(state, 'punct', '(')) {
            consume(state);
            const args = [];
            if (!match(state, 'punct', ')')) {
                args.push(parseTernary(state));
                while (match(state, 'punct', ',')) {
                    consume(state);
                    args.push(parseTernary(state));
                }
            }
            expect(state, 'punct', ')');
            return { kind: 'Call', callee: t.value, args };
        }
        return { kind: 'Identifier', name: t.value };
    }
    if (t.type === 'punct') {
        if (t.value === '(') {
            consume(state);
            const inner = parseTernary(state);
            expect(state, 'punct', ')');
            return inner;
        }
        if (t.value === '[') {
            consume(state);
            const elements = [];
            if (!match(state, 'punct', ']')) {
                elements.push(parseTernary(state));
                while (match(state, 'punct', ',')) {
                    consume(state);
                    if (match(state, 'punct', ']'))
                        break;
                    elements.push(parseTernary(state));
                }
            }
            expect(state, 'punct', ']');
            return { kind: 'Array', elements };
        }
        if (t.value === '{') {
            consume(state);
            const entries = [];
            if (!match(state, 'punct', '}')) {
                entries.push(parseObjectEntry(state));
                while (match(state, 'punct', ',')) {
                    consume(state);
                    if (match(state, 'punct', '}'))
                        break;
                    entries.push(parseObjectEntry(state));
                }
            }
            expect(state, 'punct', '}');
            return { kind: 'Object', entries };
        }
    }
    throw new ExpressionError(`Unexpected token "${t.value}" at position ${t.position}`, {
        position: t.position,
    });
}
function parseObjectEntry(state) {
    const t = peek(state);
    let key;
    if (t.type === 'identifier') {
        assertIdentAllowed(t.value, t.position);
        consume(state);
        key = t.value;
    }
    else if (t.type === 'string') {
        consume(state);
        key = t.value;
    }
    else {
        throw new ExpressionError(`Invalid object key at position ${t.position}`, {
            position: t.position,
        });
    }
    expect(state, 'punct', ':');
    const value = parseTernary(state);
    return { key, value };
}
function assertIdentAllowed(name, position) {
    if (FORBIDDEN_IDENTIFIERS.includes(name)) {
        throw new ExpressionError(`Identifier "${name}" is not allowed`, { position, name });
    }
}
//# sourceMappingURL=parser.js.map