import { ExpressionError } from '@bdui/core';
function assertArgCount(name, args, min, max = min) {
    if (args.length < min || args.length > max) {
        throw new ExpressionError(`Function "${name}" expects ${min === max ? `${min}` : `${min}..${max}`} argument(s), got ${args.length}`);
    }
}
function toNum(value) {
    if (typeof value === 'number')
        return value;
    if (typeof value === 'string')
        return Number(value);
    if (typeof value === 'boolean')
        return value ? 1 : 0;
    return Number.NaN;
}
function toStr(value) {
    if (value == null)
        return '';
    return String(value);
}
export const BUILTINS = Object.freeze({
    len(...args) {
        assertArgCount('len', args, 1);
        const v = args[0];
        if (v == null)
            return 0;
        if (typeof v === 'string' || Array.isArray(v))
            return v.length;
        if (typeof v === 'object')
            return Object.keys(v).length;
        return 0;
    },
    has(...args) {
        assertArgCount('has', args, 2);
        const [obj, key] = args;
        if (obj == null)
            return false;
        if (typeof obj === 'object') {
            return Object.prototype.hasOwnProperty.call(obj, String(key));
        }
        return false;
    },
    includes(...args) {
        assertArgCount('includes', args, 2);
        const [haystack, needle] = args;
        if (typeof haystack === 'string')
            return haystack.includes(String(needle));
        if (Array.isArray(haystack))
            return haystack.includes(needle);
        return false;
    },
    min(...args) {
        if (args.length === 0)
            return undefined;
        let best = toNum(args[0]);
        for (let i = 1; i < args.length; i++) {
            const v = toNum(args[i]);
            if (v < best)
                best = v;
        }
        return best;
    },
    max(...args) {
        if (args.length === 0)
            return undefined;
        let best = toNum(args[0]);
        for (let i = 1; i < args.length; i++) {
            const v = toNum(args[i]);
            if (v > best)
                best = v;
        }
        return best;
    },
    abs(...args) {
        assertArgCount('abs', args, 1);
        return Math.abs(toNum(args[0]));
    },
    round(...args) {
        assertArgCount('round', args, 1);
        return Math.round(toNum(args[0]));
    },
    floor(...args) {
        assertArgCount('floor', args, 1);
        return Math.floor(toNum(args[0]));
    },
    ceil(...args) {
        assertArgCount('ceil', args, 1);
        return Math.ceil(toNum(args[0]));
    },
    lower(...args) {
        assertArgCount('lower', args, 1);
        return toStr(args[0]).toLowerCase();
    },
    upper(...args) {
        assertArgCount('upper', args, 1);
        return toStr(args[0]).toUpperCase();
    },
    trim(...args) {
        assertArgCount('trim', args, 1);
        return toStr(args[0]).trim();
    },
    coalesce(...args) {
        for (const v of args) {
            if (v !== null && v !== undefined)
                return v;
        }
        return undefined;
    },
    not(...args) {
        assertArgCount('not', args, 1);
        return !args[0];
    },
    isEmpty(...args) {
        assertArgCount('isEmpty', args, 1);
        const v = args[0];
        if (v == null)
            return true;
        if (typeof v === 'string' || Array.isArray(v))
            return v.length === 0;
        if (typeof v === 'object')
            return Object.keys(v).length === 0;
        return false;
    },
    concat(...args) {
        return args.map(toStr).join('');
    },
});
//# sourceMappingURL=builtins.js.map