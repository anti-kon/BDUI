import type { Theme } from './types.js';
type Palette = {
  light: {
    bg: string;
    fg: string;
    primary: string;
    [k: string]: any;
  };
  dark: {
    bg: string;
    fg: string;
    primary: string;
    [k: string]: any;
  };
};
type ThemeProps = {
  palette: Palette;
  followSystem?: boolean;
  allowUserOverride?: boolean;
  tokens?: (p: Palette['light']) => Record<string, any>;
};
export declare function ThemeConfig(props: ThemeProps): {
  readonly __kind: 'Theme';
  readonly value: Theme;
};
type ThemeSimpleProps = {
  primary: string;
  background: string;
  darkBackground?: string;
  followSystem?: boolean;
  allowUserOverride?: boolean;
  extendTokens?: (p: any) => Record<string, any>;
};
export declare namespace ThemeConfig {
  function Simple(props: ThemeSimpleProps): {
    readonly __kind: 'Theme';
    readonly value: Theme;
  };
}
export {};
