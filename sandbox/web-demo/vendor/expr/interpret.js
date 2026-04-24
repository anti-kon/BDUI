import { ExpressionError } from '@bdui/core';
import { BUILTINS } from './builtins.js';
export function buildContext(state, params) {
    return {
        flow: state.flow ?? {},
        session: state.session ?? {},
        local: state.local ?? {},
        params: params ?? state.params ?? {},
    };
}
const ROOTS = ['flow', 'session', 'local', 'params'];
export function evaluate(node, ctx) {
    switch (node.kind) {
        case 'Null':
            return null;
        case 'Bool':
            return node.value;
        case 'Number':
            return node.value;
        case 'String':
            return node.value;
        case 'Array':
            return node.elements.map((el) => evaluate(el, ctx));
        case 'Object': {
            const obj = Object.create(null);
            for (const { key, value } of node.entries) {
                obj[key] = evaluate(value, ctx);
            }
            return obj;
        }
        case 'Identifier': {
            if (ROOTS.includes(node.name)) {
                return ctx[node.name];
            }
            throw new ExpressionError(`Unknown identifier "${node.name}". Access state via flow.*, session.*, local.* or params.*`, { identifier: node.name });
        }
        case 'Member': {
            const obj = evaluate(node.object, ctx);
            return safeGetProperty(obj, node.property);
        }
        case 'Index': {
            const obj = evaluate(node.object, ctx);
            const key = evaluate(node.index, ctx);
            return safeGetProperty(obj, String(key));
        }
        case 'Unary': {
            const v = evaluate(node.argument, ctx);
            if (node.op === '!')
                return !v;
            if (node.op === '-')
                return -v;
            if (node.op === '+')
                return +v;
            throw new ExpressionError(`Unknown unary operator "${String(node.op)}"`);
        }
        case 'Binary': {
            const l = evaluate(node.left, ctx);
            const r = evaluate(node.right, ctx);
            return applyBinary(node.op, l, r);
        }
        case 'Logical': {
            if (node.op === '&&')
                return evaluate(node.left, ctx) && evaluate(node.right, ctx);
            if (node.op === '||')
                return evaluate(node.left, ctx) || evaluate(node.right, ctx);
            if (node.op === '??') {
                const l = evaluate(node.left, ctx);
                return l == null ? evaluate(node.right, ctx) : l;
            }
            throw new ExpressionError(`Unknown logical operator "${String(node.op)}"`);
        }
        case 'Ternary':
            return evaluate(node.test, ctx)
                ? evaluate(node.consequent, ctx)
                : evaluate(node.alternate, ctx);
        case 'Call': {
            const builtins = { ...BUILTINS, ...(ctx.builtins ?? {}) };
            const fn = builtins[node.callee];
            if (typeof fn !== 'function') {
                throw new ExpressionError(`Unknown function "${node.callee}"`);
            }
            const args = node.args.map((a) => evaluate(a, ctx));
            return fn(...args);
        }
    }
    throw new ExpressionError(`Unknown AST node "${node?.kind ?? 'unknown'}"`);
}
const FORBIDDEN_PROPERTIES = new Set(['__proto__', 'prototype', 'constructor']);
function safeGetProperty(obj, key) {
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
function applyBinary(op, l, r) {
    switch (op) {
        case '+':
            if (typeof l === 'string' || typeof r === 'string')
                return String(l ?? '') + String(r ?? '');
            return l + r;
        case '-':
            return l - r;
        case '*':
            return l * r;
        case '/':
            return l / r;
        case '%':
            return l % r;
        case '==':
            return looseEquals(l, r);
        case '!=':
            return !looseEquals(l, r);
        case '<':
            return l < r;
        case '<=':
            return l <= r;
        case '>':
            return l > r;
        case '>=':
            return l >= r;
        default:
            throw new ExpressionError(`Unknown binary operator "${op}"`);
    }
}
function looseEquals(l, r) {
    if (l === r)
        return true;
    if (l == null && r == null)
        return true;
    if (typeof l === 'number' && typeof r === 'string')
        return l === Number(r);
    if (typeof l === 'string' && typeof r === 'number')
        return Number(l) === r;
    return false;
}
//# sourceMappingURL=interpret.js.map