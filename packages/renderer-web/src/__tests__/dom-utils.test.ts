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
        lineHeight: 1.55,
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
      lineHeight: '1.55',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      minHeight: '44px',
      background: 'linear-gradient(#fff, #eef2ff)',
    });
  });

  it('resolves state-driven modifier values before CSS serialization', () => {
    expect(
      cssForModifiers(
        {
          background: '{{session.theme == "dark" ? "#111827" : "#ffffff"}}',
          borderRadius: 6,
        },
        (value) =>
          value === '{{session.theme == "dark" ? "#111827" : "#ffffff"}}' ? '#111827' : value,
      ),
    ).toEqual({
      background: '#111827',
      borderRadius: '6px',
    });
  });
});
