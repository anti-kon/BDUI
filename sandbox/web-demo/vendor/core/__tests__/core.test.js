import { describe, expect, it } from 'vitest';
import { decodeExpr, encodeExpr, exprRef, isExprRef, isFlowRoute, isScreenRoute, } from '../index.js';
describe('ExprRef helpers', () => {
    it('creates and detects ExprRef', () => {
        const ref = exprRef('flow.x > 1');
        expect(isExprRef(ref)).toBe(true);
        expect(ref.code).toBe('flow.x > 1');
    });
    it('rejects empty code', () => {
        expect(() => exprRef('')).toThrow();
        expect(() => exprRef('   ')).toThrow();
    });
    it('encodes and decodes wire format', () => {
        const wire = encodeExpr(exprRef('flow.x'));
        expect(wire).toBe('{{flow.x}}');
        expect(decodeExpr(wire)).toBe('flow.x');
        expect(decodeExpr('plain')).toBeNull();
        expect(decodeExpr(123)).toBeNull();
    });
    it('isExprRef excludes non-objects and shallow matches', () => {
        expect(isExprRef(null)).toBe(false);
        expect(isExprRef('text')).toBe(false);
        expect(isExprRef({ __bduiExpr: true })).toBe(false);
    });
});
describe('navigation route guards', () => {
    it('flow and screen routes are distinguished', () => {
        const flow = { id: 'f', type: 'flow', startStep: 's', steps: [] };
        const screen = { id: 's', node: { type: 'Column', children: [] } };
        expect(isFlowRoute(flow)).toBe(true);
        expect(isScreenRoute(flow)).toBe(false);
        expect(isFlowRoute(screen)).toBe(false);
        expect(isScreenRoute(screen)).toBe(true);
    });
});
//# sourceMappingURL=core.test.js.map