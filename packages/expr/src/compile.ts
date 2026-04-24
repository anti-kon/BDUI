import { EXPR_PATTERN, type ExprRef, type RuntimeStateLike } from '@bdui/core';

import type { ExprNode } from './ast.js';
import { buildContext, type EvalContext, evaluate } from './interpret.js';
import { DEFAULT_LIMITS, type ExprLimits } from './limits.js';
import { parse } from './parser.js';

/** Compiled, cacheable expression. */
export interface CompiledExpr {
  readonly source: string;
  readonly ast: ExprNode;
  evaluate(ctx: EvalContext): unknown;
}

const cache = new Map<string, CompiledExpr>();
const CACHE_LIMIT = 1024;

export function compile(source: string, limits: ExprLimits = DEFAULT_LIMITS): CompiledExpr {
  const cached = cache.get(source);
  if (cached) return cached;

  const ast = parse(source, limits);
  const compiled: CompiledExpr = {
    source,
    ast,
    evaluate(ctx) {
      return evaluate(ast, ctx);
    },
  };

  if (cache.size >= CACHE_LIMIT) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) cache.delete(firstKey);
  }
  cache.set(source, compiled);
  return compiled;
}

export function clearCompileCache(): void {
  cache.clear();
}

/** Evaluate an expression source in a given state. */
export function evalExpression(
  source: string,
  state: RuntimeStateLike,
  params?: Record<string, unknown>,
  limits?: ExprLimits,
): unknown {
  return compile(source, limits).evaluate(buildContext(state, params));
}

/** Evaluate an ExprRef. */
export function evalExprRef(
  ref: ExprRef,
  state: RuntimeStateLike,
  params?: Record<string, unknown>,
): unknown {
  return evalExpression(ref.code, state, params);
}

/** Process a string that may contain `{{expression}}` placeholders. */
export function interpolate(
  template: string,
  state: RuntimeStateLike,
  params?: Record<string, unknown>,
): string {
  if (typeof template !== 'string') return String(template ?? '');

  const single = EXPR_PATTERN.exec(template);
  if (single && single[0] === template) {
    const code = single[1];
    if (typeof code === 'string') {
      const result = evalExpression(code, state, params);
      return result == null ? '' : String(result);
    }
  }

  return template.replace(/\{\{([\s\S]+?)\}\}/g, (_, code: string) => {
    try {
      const result = evalExpression(code, state, params);
      return result == null ? '' : String(result);
    } catch {
      return '';
    }
  });
}

/**
 * If the given value is a plain `{{...}}` string, evaluate it and return the
 * raw result (preserving type); otherwise return the original value.
 */
export function resolveValue(
  value: unknown,
  state: RuntimeStateLike,
  params?: Record<string, unknown>,
): unknown {
  if (typeof value !== 'string') return value;
  const match = EXPR_PATTERN.exec(value);
  if (!match || match[0] !== value) return value;
  const code = match[1];
  if (typeof code !== 'string') return value;
  return evalExpression(code, state, params);
}
