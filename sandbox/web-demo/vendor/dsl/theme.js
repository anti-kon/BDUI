export function ThemeConfig(props) {
  const p = props.palette;
  const tokens = props.tokens
    ? props.tokens(p.light)
    : {
        'text.body': { color: '{fg}' },
        'button.primary.bg': { color: '{primary}' },
      };
  const json = {
    followSystem: props.followSystem ?? true,
    allowUserOverride: props.allowUserOverride ?? true,
    palette: props.palette,
    tokens,
  };
  return { __kind: 'Theme', value: json };
}
(function (ThemeConfig) {
  function Simple(props) {
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
    const json = {
      followSystem: props.followSystem ?? true,
      allowUserOverride: props.allowUserOverride ?? true,
      palette,
      tokens,
    };
    return { __kind: 'Theme', value: json };
  }
  ThemeConfig.Simple = Simple;
})(ThemeConfig || (ThemeConfig = {}));
