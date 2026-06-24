import { ExpressionError, type RuntimeStateLike } from '@bdui/core';

import type { ExprNode } from './ast.js';
import { type BuiltinFn, BUILTINS } from './builtins.js';
import { applyBinary } from './operators.js';
import { safeGetProperty } from './property-access.js';

export interface EvalContext {
  readonly flow: Readonly<Record<string, unknown>>;
  readonly session: Readonly<Record<string, unknown>>;
  readonly local: Readonly<Record<string, unknown>>;
  readonly params: Readonly<Record<string, unknown>>;
  readonly builtins?: Readonly<Record<string, BuiltinFn>>;
}

export function buildContext(
  state: RuntimeStateLike,
  params?: Record<string, unknown>,
): EvalContext {
  return {
    flow: state.flow ?? {},
    session: state.session ?? {},
    local: state.local ?? {},
    params: params ?? state.params ?? {},
  };
}

const ROOTS: readonly string[] = ['flow', 'session', 'local', 'params'];

export function evaluate(node: ExprNode, ctx: EvalContext): unknown {
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
      const obj: Record<string, unknown> = Object.create(null);
      for (const { key, value } of node.entries) {
        obj[key] = evaluate(value, ctx);
      }
      return obj;
    }

    case 'Identifier': {
      if ((ROOTS as readonly string[]).includes(node.name)) {
        return (ctx as unknown as Record<string, unknown>)[node.name];
      }
      throw new ExpressionError(
        `Unknown identifier "${node.name}". Access state via flow.*, session.*, local.* or params.*`,
        { identifier: node.name },
      );
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
      if (node.op === '!') return !v;
      if (node.op === '-') return -(v as number);
      if (node.op === '+') return +(v as number);
      throw new ExpressionError(`Unknown unary operator "${String(node.op)}"`);
    }

    case 'Binary': {
      const l = evaluate(node.left, ctx);
      const r = evaluate(node.right, ctx);
      return applyBinary(node.op, l, r);
    }

    case 'Logical': {
      if (node.op === '&&') return evaluate(node.left, ctx) && evaluate(node.right, ctx);
      if (node.op === '||') return evaluate(node.left, ctx) || evaluate(node.right, ctx);
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
  throw new ExpressionError(
    `Unknown AST node "${(node as { kind?: string } | null)?.kind ?? 'unknown'}"`,
  );
}
