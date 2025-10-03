import type { Theme } from './types';

type Palette = {
  light: { bg: string; fg: string; primary: string; [k: string]: any };
  dark:  { bg: string; fg: string; primary: string; [k: string]: any };
};

type ThemeProps = {
  palette: Palette;
  followSystem?: boolean;
  allowUserOverride?: boolean;
  tokens?: (p: Palette['light']) => Record<string, any>;
};

export function ThemeConfig(props: ThemeProps) {
  const p = props.palette;
  const tokens = props.tokens ? props.tokens(p.light) : {
    "text.body": { color: "{fg}" },
    "button.primary.bg": { color: "{primary}" }
  };
  const json: Theme = {
    followSystem: props.followSystem ?? true,
    allowUserOverride: props.allowUserOverride ?? true,
    palette: props.palette,
    tokens
  } as any;
  return { __kind: 'Theme', value: json } as const;
}

type ThemeSimpleProps = {
  primary: string;
  background: string;
  darkBackground?: string;
  followSystem?: boolean;
  allowUserOverride?: boolean;
  extendTokens?: (p: any) => Record<string, any>;
};

export namespace ThemeConfig {
  export function Simple(props: ThemeSimpleProps) {
    const palette: Palette = {
      light: { bg: props.background, fg: "#111111", primary: props.primary },
      dark:  { bg: props.darkBackground ?? "#111111", fg: "#FFFFFF", primary: props.primary }
    };
    const baseTokens = {
      "text.body": { color: "{fg}" },
      "button.primary.bg": { color: "{primary}" }
    };
    const tokens = props.extendTokens ? { ...baseTokens, ...props.extendTokens(palette.light) } : baseTokens;
    const json: Theme = {
      followSystem: props.followSystem ?? true,
      allowUserOverride: props.allowUserOverride ?? true,
      palette,
      tokens
    } as any;
    return { __kind: 'Theme', value: json } as const;
  }
}
