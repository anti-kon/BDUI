import { ExpressionError } from '@bdui/core';

import type { ExprNode } from './ast.js';
import type { ExprLimits } from './limits.js';

/**
 * Walk a parsed AST and reject trees that exceed the configured node-count or
 * nesting-depth limits. Run after parsing so untrusted expressions cannot blow
 * up the interpreter.
 */
export function enforceLimits(root: ExprNode, limits: ExprLimits): void {
  let count = 0;
  const walk = (node: ExprNode, depth: number): void => {
    count++;
    if (count > limits.maxNodes) {
      throw new ExpressionError(`Expression node count exceeds limit (${limits.maxNodes})`);
    }
    if (depth > limits.maxDepth) {
      throw new ExpressionError(`Expression depth exceeds limit (${limits.maxDepth})`);
    }
    switch (node.kind) {
      case 'Array':
        for (const el of node.elements) walk(el, depth + 1);
        return;
      case 'Object':
        for (const { value } of node.entries) walk(value, depth + 1);
        return;
      case 'Member':
      case 'Index':
        walk(node.object, depth + 1);
        if (node.kind === 'Index') walk(node.index, depth + 1);
        return;
      case 'Unary':
        walk(node.argument, depth + 1);
        return;
      case 'Binary':
      case 'Logical':
        walk(node.left, depth + 1);
        walk(node.right, depth + 1);
        return;
      case 'Ternary':
        walk(node.test, depth + 1);
        walk(node.consequent, depth + 1);
        walk(node.alternate, depth + 1);
        return;
      case 'Call':
        for (const a of node.args) walk(a, depth + 1);
        return;
      default:
        return;
    }
  };
  walk(root, 0);
}
