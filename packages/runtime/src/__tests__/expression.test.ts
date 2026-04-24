import { exprRef } from '@bdui/core';
import { describe, expect, it } from 'vitest';

import { evaluate, evaluateGuard, interpolateTemplate } from '../expression.js';

describe('evaluate', () => {
  it('returns plain values untouched', () => {
    expect(evaluate<number>(42 as never, {})).toBe(42);
  });

  it('evaluates ExprRef', () => {
    const state = { flow: { count: 4 } } as never;
    expect(evaluate<number>(exprRef('flow.count + 1') as never, state)).toBe(5);
  });

  it('interpolates templates when no direct match', () => {
    const state = { session: { name: 'Ann' } } as never;
    expect(evaluate<string>('Hi {{session.name}}!' as never, state)).toBe('Hi Ann!');
  });
});

describe('evaluateGuard', () => {
  it('returns true for empty-safe expressions', () => {
    expect(evaluateGuard('flow.x > 0', { flow: { x: 3 } } as never)).toBe(true);
    expect(evaluateGuard('flow.x > 0', { flow: { x: 0 } } as never)).toBe(false);
  });

  it('returns false on evaluation errors', () => {
    expect(evaluateGuard('unknown()', {} as never)).toBe(false);
  });

  it('supports ExprRef input', () => {
    expect(evaluateGuard(exprRef('session.n == 3'), { session: { n: 3 } } as never)).toBe(true);
  });
});

describe('interpolateTemplate', () => {
  it('substitutes placeholders', () => {
    expect(interpolateTemplate('total={{flow.total}}', { flow: { total: 5 } } as never)).toBe(
      'total=5',
    );
  });
});
