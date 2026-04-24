import { describe, expect, it } from 'vitest';

import { compile, evalExpression, interpolate, resolveValue } from '../compile.js';

const emptyState = { flow: {}, session: {}, local: {}, params: {} };

describe('evaluator', () => {
  it('evaluates arithmetic', () => {
    expect(evalExpression('1 + 2 * 3', emptyState)).toBe(7);
    expect(evalExpression('(1 + 2) * 3', emptyState)).toBe(9);
    expect(evalExpression('10 % 3', emptyState)).toBe(1);
  });

  it('evaluates string concat via +', () => {
    expect(evalExpression('"hello " + "world"', emptyState)).toBe('hello world');
    expect(evalExpression('"x=" + 42', emptyState)).toBe('x=42');
  });

  it('evaluates comparisons and equality', () => {
    expect(evalExpression('1 < 2', emptyState)).toBe(true);
    expect(evalExpression('2 == "2"', emptyState)).toBe(true);
    expect(evalExpression('2 != "3"', emptyState)).toBe(true);
  });

  it('short-circuits logical operators', () => {
    expect(evalExpression('true && 7', emptyState)).toBe(7);
    expect(evalExpression('false && boom', emptyState)).toBe(false);
    expect(evalExpression('null ?? 42', emptyState)).toBe(42);
    expect(evalExpression('0 ?? 42', emptyState)).toBe(0);
  });

  it('accesses state via scope roots', () => {
    const state = {
      flow: { counter: 3, items: [10, 20, 30] },
      session: { user: { name: 'Ada' } },
      local: { draft: 'hi' },
    };
    expect(evalExpression('flow.counter', state)).toBe(3);
    expect(evalExpression('flow.items[1]', state)).toBe(20);
    expect(evalExpression('session.user.name', state)).toBe('Ada');
    expect(evalExpression('local.draft', state)).toBe('hi');
  });

  it('returns undefined for missing paths', () => {
    expect(evalExpression('flow.missing.deep', emptyState)).toBeUndefined();
    expect(evalExpression('flow.list[42]', emptyState)).toBeUndefined();
  });

  it('supports ternary', () => {
    const state = { flow: { count: 5 }, session: {}, local: {} };
    expect(evalExpression('flow.count > 0 ? "yes" : "no"', state)).toBe('yes');
  });

  it('supports array and object literals', () => {
    expect(evalExpression('[1, 2, 3]', emptyState)).toEqual([1, 2, 3]);
    expect(evalExpression('{ a: 1, b: 2 }', emptyState)).toEqual({ a: 1, b: 2 });
  });

  it('invokes whitelisted builtins', () => {
    expect(evalExpression('len("abc")', emptyState)).toBe(3);
    expect(evalExpression('len([1,2,3,4])', emptyState)).toBe(4);
    expect(evalExpression('upper("abc")', emptyState)).toBe('ABC');
    expect(evalExpression('min(3, 1, 4, 1, 5)', emptyState)).toBe(1);
    expect(evalExpression('max(3, 1, 4, 1, 5)', emptyState)).toBe(5);
    expect(evalExpression('coalesce(null, null, "x")', emptyState)).toBe('x');
    expect(evalExpression('isEmpty("")', emptyState)).toBe(true);
  });

  it('rejects prototype-pollution attempts', () => {
    const state = { flow: { x: {} }, session: {}, local: {} };
    expect(() => evalExpression('flow.x.__proto__', state)).toThrow();
    expect(() => evalExpression('flow.x.constructor', state)).toThrow();
    expect(() => evalExpression('flow.x["constructor"]', state)).toThrow();
  });

  it('rejects unknown identifiers', () => {
    expect(() => evalExpression('Math', emptyState)).toThrow();
    expect(() => evalExpression('process.env', emptyState)).toThrow();
  });

  it('rejects unknown function calls', () => {
    expect(() => evalExpression('eval("1+1")', emptyState)).toThrow();
    expect(() => evalExpression('unknownFn()', emptyState)).toThrow();
  });

  it('caches compiled expressions', () => {
    const a = compile('flow.x + 1');
    const b = compile('flow.x + 1');
    expect(a).toBe(b);
  });
});

describe('interpolate', () => {
  it('returns raw value for single-expression templates', () => {
    const state = { flow: { n: 7 }, session: {}, local: {} };
    expect(interpolate('{{flow.n}}', state)).toBe('7');
    expect(interpolate('Count: {{flow.n}}', state)).toBe('Count: 7');
  });

  it('silently swallows errors in template mode', () => {
    expect(interpolate('x = {{flow.missing.deep}}', { flow: {}, session: {}, local: {} })).toBe(
      'x = ',
    );
  });
});

describe('resolveValue', () => {
  it('preserves raw types for single-expression strings', () => {
    const state = { flow: { on: true, list: [1, 2] }, session: {}, local: {} };
    expect(resolveValue('{{flow.on}}', state)).toBe(true);
    expect(resolveValue('{{flow.list}}', state)).toEqual([1, 2]);
  });

  it('passes through non-expressions unchanged', () => {
    expect(resolveValue('hello', emptyState)).toBe('hello');
    expect(resolveValue(42, emptyState)).toBe(42);
    expect(resolveValue(null, emptyState)).toBeNull();
  });
});
