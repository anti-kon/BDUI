import { createNode } from './builders/shared.js';
export function ThemeConfig(props) {
    const tokens = props.tokens
        ? props.tokens(props.palette.light)
        : {
            'text.body': { color: '{fg}' },
            'button.primary.bg': { color: '{primary}' },
        };
    const theme = {
        followSystem: props.followSystem ?? true,
        allowUserOverride: props.allowUserOverride ?? true,
        palette: props.palette,
        tokens,
    };
    return createNode('Theme', theme);
}
function simple(props) {
    const palette = {
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
    const theme = {
        followSystem: props.followSystem ?? true,
        allowUserOverride: props.allowUserOverride ?? true,
        palette: palette,
        tokens,
    };
    return createNode('Theme', theme);
}
ThemeConfig.Simple = simple;
//# sourceMappingURL=theme.js.map