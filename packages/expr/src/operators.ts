import { ExpressionError } from '@bdui/core';

/**
 * Arithmetic, comparison and equality semantics for the expression language.
 * Kept separate from the tree-walker so the operator rules read as a unit.
 */
export function applyBinary(op: string, l: unknown, r: unknown): unknown {
  switch (op) {
    case '+':
      if (typeof l === 'string' || typeof r === 'string') return String(l ?? '') + String(r ?? '');
      return (l as number) + (r as number);
    case '-':
      return (l as number) - (r as number);
    case '*':
      return (l as number) * (r as number);
    case '/':
      return (l as number) / (r as number);
    case '%':
      return (l as number) % (r as number);
    case '==':
      return looseEquals(l, r);
    case '!=':
      return !looseEquals(l, r);
    case '<':
      return (l as number) < (r as number);
    case '<=':
      return (l as number) <= (r as number);
    case '>':
      return (l as number) > (r as number);
    case '>=':
      return (l as number) >= (r as number);
    default:
      throw new ExpressionError(`Unknown binary operator "${op}"`);
  }
}

export function looseEquals(l: unknown, r: unknown): boolean {
  if (l === r) return true;
  if (l == null && r == null) return true;
  if (typeof l === 'number' && typeof r === 'string') return l === Number(r);
  if (typeof l === 'string' && typeof r === 'number') return Number(l) === r;
  return false;
}
