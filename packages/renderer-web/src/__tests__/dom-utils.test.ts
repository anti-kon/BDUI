import { describe, expect, it } from 'vitest';

import { cssForModifiers } from '../dom-utils.js';

describe('cssForModifiers', () => {
  it('maps platform modifiers and nested web styles to inline CSS', () => {
    expect(
      cssForModifiers({
        role: 'title',
        variant: 'primary',
        padding: 12,
        borderRadius: 10,
        align: 'start',
        justify: 'between',
        style: {
          minHeight: 44,
          background: 'linear-gradient(#fff, #eef2ff)',
        },
      }),
    ).toEqual({
      padding: '12px',
      borderRadius: '10px',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      minHeight: '44px',
      background: 'linear-gradient(#fff, #eef2ff)',
    });
  });
});
