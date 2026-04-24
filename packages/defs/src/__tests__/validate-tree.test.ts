import type { BDUIElement } from '@bdui/core';
import { describe, expect, it } from 'vitest';

import { validateTree } from '../validate-tree.js';

type TestNode = BDUIElement & { readonly children?: readonly TestNode[] };

describe('validateTree', () => {
  it('accepts a well-formed tree of known components', () => {
    const tree: TestNode = {
      type: 'Column',
      children: [
        { type: 'Text', text: 'hello' } as BDUIElement,
        { type: 'Button', title: 'Ok' } as BDUIElement,
      ],
    } as BDUIElement;
    const result = validateTree(tree);
    expect(result.ok).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('reports unknown component', () => {
    const tree = { type: 'Mystery' } as BDUIElement;
    const result = validateTree(tree);
    expect(result.ok).toBe(false);
    expect(result.issues[0]?.code).toBe('UNKNOWN_COMPONENT');
  });

  it('rejects children on a text-only component like Button', () => {
    const tree: TestNode = {
      type: 'Button',
      title: 'ok',
      children: [{ type: 'Text', text: 'x' } as BDUIElement],
    } as BDUIElement;
    const result = validateTree(tree);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.code === 'CHILDREN_NOT_ALLOWED')).toBe(true);
  });

  it('reports nested unknown components with their path', () => {
    const tree: TestNode = {
      type: 'Column',
      children: [{ type: 'Mystery' } as BDUIElement],
    } as BDUIElement;
    const result = validateTree(tree);
    expect(result.issues.some((i) => i.code === 'UNKNOWN_COMPONENT')).toBe(true);
    expect(result.issues[0]?.path).toContain('Mystery');
  });
});
