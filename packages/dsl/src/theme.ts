import type { Theme } from '@bdui/core';

import { createNode, type DslNode } from './builders/shared.js';

export interface PaletteMode {
  bg: string;
  fg: string;
  primary: string;
  [token: string]: string;
}

export interface Palette {
  light: PaletteMode;
  dark: PaletteMode;
}

export interface ThemeProps {
  palette: Palette;
  followSystem?: boolean;
  allowUserOverride?: boolean;
  tokens?: (p: PaletteMode) => Record<string, unknown>;
}

export function ThemeConfig(props: ThemeProps): DslNode<'Theme', Theme> {
  const tokens = props.tokens
    ? props.tokens(props.palette.light)
    : {
        'text.body': { color: '{fg}' },
        'button.primary.bg': { color: '{primary}' },
      };
  const theme: Theme = {
    followSystem: props.followSystem ?? true,
    allowUserOverride: props.allowUserOverride ?? true,
    palette: props.palette as unknown as Record<string, unknown>,
    tokens,
  };
  return createNode('Theme', theme);
}

export interface ThemeSimpleProps {
  primary: string;
  background: string;
  darkBackground?: string;
  followSystem?: boolean;
  allowUserOverride?: boolean;
  extendTokens?: (p: PaletteMode) => Record<string, unknown>;
}

function simple(props: ThemeSimpleProps): DslNode<'Theme', Theme> {
  const palette: Palette = {
    light: { bg: props.background, fg: '#111111', primary: props.primary },
    dark: { bg: props.darkBackground ?? '#111111', fg: '#FFFFFF', primary: props.primary },
  };
  const baseTokens = {
    'text.body': { color: '{fg}' },
    'button.primary.bg': { color: '{primary}' },
  };
  const tokens = props.extendTokens
    ? { ...baseTokens, ...props.extendTokens(palette.light) }
    : baseTokens;
  const theme: Theme = {
    followSystem: props.followSystem ?? true,
    allowUserOverride: props.allowUserOverride ?? true,
    palette: palette as unknown as Record<string, unknown>,
    tokens,
  };
  return createNode('Theme', theme);
}

ThemeConfig.Simple = simple;
