import { describe, expect, it } from 'vitest';
import { parse } from '../parser.js';
describe('parser', () => {
    it('parses number literals', () => {
        expect(parse('42')).toEqual({ kind: 'Number', value: 42 });
        expect(parse('3.14')).toEqual({ kind: 'Number', value: 3.14 });
        expect(parse('1e3')).toEqual({ kind: 'Number', value: 1000 });
    });
    it('parses string literals with escapes', () => {
        expect(parse('"hello"')).toEqual({ kind: 'String', value: 'hello' });
        expect(parse("'it\\'s ok'")).toEqual({ kind: 'String', value: "it's ok" });
    });
    it('parses boolean and null', () => {
        expect(parse('true')).toEqual({ kind: 'Bool', value: true });
        expect(parse('false')).toEqual({ kind: 'Bool', value: false });
        expect(parse('null')).toEqual({ kind: 'Null' });
    });
    it('parses identifiers and member access', () => {
        expect(parse('flow.counter')).toEqual({
            kind: 'Member',
            object: { kind: 'Identifier', name: 'flow' },
            property: 'counter',
        });
    });
    it('parses binary arithmetic with correct precedence', () => {
        expect(parse('1 + 2 * 3')).toEqual({
            kind: 'Binary',
            op: '+',
            left: { kind: 'Number', value: 1 },
            right: {
                kind: 'Binary',
                op: '*',
                left: { kind: 'Number', value: 2 },
                right: { kind: 'Number', value: 3 },
            },
        });
    });
    it('parses logical operators with short-circuit', () => {
        const ast = parse('a && b || c');
        expect(ast.kind).toBe('Logical');
    });
    it('parses ternary', () => {
        const ast = parse('flow.x > 0 ? "yes" : "no"');
        expect(ast.kind).toBe('Ternary');
    });
    it('parses function calls', () => {
        expect(parse('len(flow.list)')).toEqual({
            kind: 'Call',
            callee: 'len',
            args: [
                {
                    kind: 'Member',
                    object: { kind: 'Identifier', name: 'flow' },
                    property: 'list',
                },
            ],
        });
    });
    it('rejects forbidden identifiers', () => {
        expect(() => parse('constructor')).toThrow();
        expect(() => parse('flow.__proto__')).toThrow();
        expect(() => parse('this')).toThrow();
        expect(() => parse('globalThis')).toThrow();
    });
    it('rejects unterminated strings', () => {
        expect(() => parse("'hello")).toThrow();
    });
    it('rejects unexpected tokens', () => {
        expect(() => parse('1 + ')).toThrow();
        expect(() => parse('1 + + +')).toThrow();
        expect(() => parse('( 1 + 2')).toThrow();
    });
    it('enforces source length limit', () => {
        const long = 'a.'.repeat(2000) + 'end';
        expect(() => parse(long)).toThrow(/limit/);
    });
    it('enforces depth limit', () => {
        let expr = 'a.b';
        for (let i = 0; i < 64; i++)
            expr = `${expr}.x`;
        expect(() => parse(expr)).toThrow(/depth|node/);
    });
    it('enforces node count limit', () => {
        // 300 digit literals joined by '+' produce ~600 AST nodes (well over 256)
        // while staying under the source length limit.
        const expr = Array.from({ length: 300 }, () => '1').join('+');
        expect(() => parse(expr)).toThrow(/node|limit/);
    });
});
//# sourceMappingURL=parser.test.js.map