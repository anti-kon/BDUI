import { ExpressionError } from '@bdui/core';

import { type Token } from './lexer.js';
import { FORBIDDEN_IDENTIFIERS } from './limits.js';

/**
 * Mutable cursor over the token stream produced by the lexer. The recursive
 * descent grammar in `parser.ts` advances this cursor while building the AST.
 */
export interface ParserState {
  readonly tokens: readonly Token[];
  index: number;
}

export function peek(state: ParserState): Token {
  const t = state.tokens[state.index];
  if (!t) throw new ExpressionError('Unexpected end of input');
  return t;
}

export function consume(state: ParserState): Token {
  const t = peek(state);
  state.index++;
  return t;
}

export function match(state: ParserState, type: Token['type'], value?: string): boolean {
  const t = peek(state);
  if (t.type !== type) return false;
  if (value !== undefined && t.value !== value) return false;
  return true;
}

export function expect(state: ParserState, type: Token['type'], value?: string): Token {
  if (!match(state, type, value)) {
    const t = peek(state);
    const want = value ?? type;
    throw new ExpressionError(
      `Expected "${want}" but got "${t.value}" (${t.type}) at position ${t.position}`,
      { position: t.position, expected: want, actualType: t.type, actualValue: t.value },
    );
  }
  return consume(state);
}

export function assertIdentAllowed(name: string, position: number): void {
  if ((FORBIDDEN_IDENTIFIERS as readonly string[]).includes(name)) {
    throw new ExpressionError(`Identifier "${name}" is not allowed`, { position, name });
  }
}
