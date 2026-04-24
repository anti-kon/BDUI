import { describe, expect, it } from 'vitest';
import { normalizeOne, normalizeActions } from '../actions-normalize.js';
import { Flow } from '../state.js';
describe('normalizeOne', () => {
    it('parses string targets', () => {
        const result = normalizeOne({ set: ['flow.counter', 1] });
        expect(result).toEqual({
            type: 'set',
            params: { target: { scope: 'flow', path: 'counter' }, value: 1 },
        });
    });
    it('handles StateVar targets for inc', () => {
        const counter = Flow('counter', 0);
        const result = normalizeOne({ inc: counter });
        expect(result).toEqual({
            type: 'update.inc',
            params: { target: { scope: 'flow', path: 'counter' }, by: undefined },
        });
    });
    it('supports batch with nested actions', () => {
        const normalized = normalizeOne({
            batch: [
                { set: ['flow.a', 1] },
                { inc: 'flow.a' },
            ],
        });
        expect(normalized.type).toBe('batch');
        expect(normalized.params.actions).toHaveLength(2);
    });
    it('preserves object-form when guard is a raw string', () => {
        const result = normalizeOne({
            when: {
                if: 'flow.x > 0',
                then: [{ set: ['flow.y', 1] }],
            },
        });
        expect(result.type).toBe('when');
    });
    it('throws on invalid scope', () => {
        expect(() => normalizeOne({ set: ['unknown.x', 1] })).toThrow();
    });
    it('normalizes arrays of actions', () => {
        const list = normalizeActions([{ navigate: ['home'] }, { back: true }]);
        expect(list).toHaveLength(2);
        expect(list[0]?.type).toBe('navigate');
        expect(list[1]?.type).toBe('back');
    });
});
