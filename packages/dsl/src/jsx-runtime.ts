type JsxComponent<TProps> = (props: TProps) => unknown;

export const Fragment = <P extends { children?: unknown }>(props: P): unknown =>
  props.children ?? [];

function cleanProps(obj: Record<string, unknown> | null | undefined): Record<string, unknown> {
  if (!obj) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

export function jsx<TProps extends Record<string, unknown>>(
  type: JsxComponent<TProps> | string,
  props: TProps | null,
  key?: unknown,
): unknown {
  if (typeof type === 'function') {
    const merged = cleanProps({ ...(props ?? {}), key });
    return type(merged as unknown as TProps);
  }
  throw new Error(
    `Unsupported JSX element type: "${String(type)}". Only function components are allowed.`,
  );
}

export const jsxs = jsx;
export const jsxDEV = jsx;
