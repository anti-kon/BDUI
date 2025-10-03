import type { BDUIElement } from './types';
export const Fragment = (props: { children?: any }) => props.children ?? [];
function cleanProps(obj: any) {
  if (!obj || typeof obj !== 'object') return obj;
  const out: any = {};
  for (const [k,v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out;
}
export function jsx(type: any, props: any, key?: any): BDUIElement | any {
  if (typeof type === 'function') return type(cleanProps({ ...(props||{}), key }));
  throw new Error('Unsupported JSX element type');
}
export const jsxs = jsx;
