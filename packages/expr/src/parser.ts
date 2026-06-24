import { ExpressionError } from '@bdui/core';

import type {
  BinaryOperator,
  ExprNode,
  LogicalOperator,
  ObjectEntry,
  UnaryOperator,
} from './ast.js';
import { enforceLimits } from './enforce-limits.js';
import { tokenize } from './lexer.js';
import { DEFAULT_LIMITS, type ExprLimits } from './limits.js';
import {
  assertIdentAllowed,
  consume,
  expect,
  match,
  type ParserState,
  peek,
} from './token-cursor.js';

export function parse(source: string, limits: ExprLimits = DEFAULT_LIMITS): ExprNode {
  if (typeof source !== 'string') {
    throw new ExpressionError('Source must be a string');
  }
  if (source.length > limits.maxSourceLength) {
    throw new ExpressionError(
      `Source length (${source.length}) exceeds limit (${limits.maxSourceLength})`,
    );
  }

  const tokens = tokenize(source);
  const state: ParserState = { tokens, index: 0 };
  const node = parseTernary(state);

  if (!match(state, 'eof')) {
    const t = peek(state);
    throw new ExpressionError(`Unexpected token "${t.value}" at position ${t.position}`, {
      position: t.position,
    });
  }

  enforceLimits(node, limits);
  return node;
}

function parseTernary(state: ParserState): ExprNode {
  const test = parseNullishCoalescing(state);
  if (match(state, 'punct', '?')) {
    consume(state);
    const consequent = parseTernary(state);
    expect(state, 'punct', ':');
    const alternate = parseTernary(state);
    return { kind: 'Ternary', test, consequent, alternate };
  }
  return test;
}

function parseNullishCoalescing(state: ParserState): ExprNode {
  return parseLogicalLevel(state, ['??'], parseLogicalOr);
}

function parseLogicalOr(state: ParserState): ExprNode {
  return parseLogicalLevel(state, ['||'], parseLogicalAnd);
}

function parseLogicalAnd(state: ParserState): ExprNode {
  return parseLogicalLevel(state, ['&&'], parseEquality);
}

function parseLogicalLevel(
  state: ParserState,
  ops: readonly LogicalOperator[],
  next: (state: ParserState) => ExprNode,
): ExprNode {
  let left = next(state);
  while (true) {
    const t = peek(state);
    if (t.type !== 'punct') break;
    const op = ops.find((o) => o === t.value) as LogicalOperator | undefined;
    if (!op) break;
    consume(state);
    const right = next(state);
    left = { kind: 'Logical', op, left, right };
  }
  return left;
}

function parseEquality(state: ParserState): ExprNode {
  return parseBinaryLevel(state, ['==', '!='], parseComparison);
}

function parseComparison(state: ParserState): ExprNode {
  return parseBinaryLevel(state, ['<', '<=', '>', '>='], parseAdditive);
}

function parseAdditive(state: ParserState): ExprNode {
  return parseBinaryLevel(state, ['+', '-'], parseMultiplicative);
}

function parseMultiplicative(state: ParserState): ExprNode {
  return parseBinaryLevel(state, ['*', '/', '%'], parseUnary);
}

function parseBinaryLevel(
  state: ParserState,
  ops: readonly BinaryOperator[],
  next: (state: ParserState) => ExprNode,
): ExprNode {
  let left = next(state);
  while (true) {
    const t = peek(state);
    if (t.type !== 'punct') break;
    const op = ops.find((o) => o === t.value) as BinaryOperator | undefined;
    if (!op) break;
    consume(state);
    const right = next(state);
    left = { kind: 'Binary', op, left, right };
  }
  return left;
}

function parseUnary(state: ParserState): ExprNode {
  const t = peek(state);
  if (t.type === 'punct' && (t.value === '!' || t.value === '-' || t.value === '+')) {
    consume(state);
    const argument = parseUnary(state);
    return { kind: 'Unary', op: t.value as UnaryOperator, argument };
  }
  return parsePostfix(state);
}

function parsePostfix(state: ParserState): ExprNode {
  let node = parsePrimary(state);
  while (true) {
    if (match(state, 'punct', '.')) {
      consume(state);
      const ident = expect(state, 'identifier');
      assertIdentAllowed(ident.value, ident.position);
      node = { kind: 'Member', object: node, property: ident.value };
    } else if (match(state, 'punct', '[')) {
      consume(state);
      const index = parseTernary(state);
      expect(state, 'punct', ']');
      node = { kind: 'Index', object: node, index };
    } else {
      break;
    }
  }
  return node;
}

function parsePrimary(state: ParserState): ExprNode {
  const t = peek(state);

  if (t.type === 'number') {
    consume(state);
    const value = Number(t.value);
    if (!Number.isFinite(value)) {
      throw new ExpressionError(`Invalid number literal "${t.value}"`, {
        position: t.position,
      });
    }
    return { kind: 'Number', value };
  }

  if (t.type === 'string') {
    consume(state);
    return { kind: 'String', value: t.value };
  }

  if (t.type === 'identifier') {
    if (t.value === 'true' || t.value === 'false') {
      consume(state);
      return { kind: 'Bool', value: t.value === 'true' };
    }
    if (t.value === 'null' || t.value === 'undefined') {
      consume(state);
      return { kind: 'Null' };
    }
    assertIdentAllowed(t.value, t.position);
    consume(state);
    if (match(state, 'punct', '(')) {
      consume(state);
      const args: ExprNode[] = [];
      if (!match(state, 'punct', ')')) {
        args.push(parseTernary(state));
        while (match(state, 'punct', ',')) {
          consume(state);
          args.push(parseTernary(state));
        }
      }
      expect(state, 'punct', ')');
      return { kind: 'Call', callee: t.value, args };
    }
    return { kind: 'Identifier', name: t.value };
  }

  if (t.type === 'punct') {
    if (t.value === '(') {
      consume(state);
      const inner = parseTernary(state);
      expect(state, 'punct', ')');
      return inner;
    }
    if (t.value === '[') {
      consume(state);
      const elements: ExprNode[] = [];
      if (!match(state, 'punct', ']')) {
        elements.push(parseTernary(state));
        while (match(state, 'punct', ',')) {
          consume(state);
          if (match(state, 'punct', ']')) break;
          elements.push(parseTernary(state));
        }
      }
      expect(state, 'punct', ']');
      return { kind: 'Array', elements };
    }
    if (t.value === '{') {
      consume(state);
      const entries: ObjectEntry[] = [];
      if (!match(state, 'punct', '}')) {
        entries.push(parseObjectEntry(state));
        while (match(state, 'punct', ',')) {
          consume(state);
          if (match(state, 'punct', '}')) break;
          entries.push(parseObjectEntry(state));
        }
      }
      expect(state, 'punct', '}');
      return { kind: 'Object', entries };
    }
  }

  throw new ExpressionError(`Unexpected token "${t.value}" at position ${t.position}`, {
    position: t.position,
  });
}

function parseObjectEntry(state: ParserState): ObjectEntry {
  const t = peek(state);
  let key: string;
  if (t.type === 'identifier') {
    assertIdentAllowed(t.value, t.position);
    consume(state);
    key = t.value;
  } else if (t.type === 'string') {
    consume(state);
    key = t.value;
  } else {
    throw new ExpressionError(`Invalid object key at position ${t.position}`, {
      position: t.position,
    });
  }
  expect(state, 'punct', ':');
  const value = parseTernary(state);
  return { key, value };
}
