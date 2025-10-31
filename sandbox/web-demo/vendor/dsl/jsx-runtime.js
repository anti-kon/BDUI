export const Fragment = (props) => props.children ?? [];
function cleanProps(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out;
}
export function jsx(type, props, key) {
  if (typeof type === 'function') return type(cleanProps({ ...(props || {}), key }));
  throw new Error('Unsupported JSX element type');
}
export const jsxs = jsx;
