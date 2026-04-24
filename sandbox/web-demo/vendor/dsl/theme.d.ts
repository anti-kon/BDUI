import type { Theme } from '@bdui/core';
import { type DslNode } from './builders/shared.js';
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
export declare function ThemeConfig(props: ThemeProps): DslNode<'Theme', Theme>;
export declare namespace ThemeConfig {
    var Simple: typeof simple;
}
export interface ThemeSimpleProps {
    primary: string;
    background: string;
    darkBackground?: string;
    followSystem?: boolean;
    allowUserOverride?: boolean;
    extendTokens?: (p: PaletteMode) => Record<string, unknown>;
}
declare function simple(props: ThemeSimpleProps): DslNode<'Theme', Theme>;
export {};
//# sourceMappingURL=theme.d.ts.map