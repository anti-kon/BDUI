import { describe, expect, it } from 'vitest';

import { clearCompileCache, compile, evalExpression, interpolate, resolveValue } from '../index.js';

describe('compile', () => {
  it('reuses compiled expressions via cache', () => {
    clearCompileCache();
    const c1 = compile('flow.x + 1');
    const c2 = compile('flow.x + 1');
    expect(c1).toBe(c2);
  });

  it('evaluates basic arithmetic', () => {
    expect(evalExpression('1 + 2 * 3', {})).toBe(7);
  });

  it('interpolates templates', () => {
    expect(interpolate('hi {{session.user}}!', { session: { user: 'Ann' } } as never)).toBe(
      'hi Ann!',
    );
  });

  it('returns original string when no placeholders are present', () => {
    expect(resolveValue('plain', {})).toBe('plain');
  });

  it('throws on forbidden identifiers', () => {
    expect(() => evalExpression('globalThis', {})).toThrow();
    expect(() => evalExpression('process', {})).toThrow();
  });

  it('respects boolean operators', () => {
    expect(evalExpression('flow.x > 2 && flow.x < 10', { flow: { x: 5 } } as never)).toBe(true);
    expect(evalExpression('flow.x > 2 || false', { flow: { x: 1 } } as never)).toBe(false);
  });

  it('evaluates ternary expressions', () => {
    expect(evalExpression('flow.x > 0 ? "pos" : "neg"', { flow: { x: 1 } } as never)).toBe('pos');
  });

  it('supports builtins', () => {
    expect(evalExpression('len("abc")', {})).toBe(3);
    expect(evalExpression('upper("ab")', {})).toBe('AB');
  });
});
