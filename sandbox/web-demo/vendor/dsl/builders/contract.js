import { __collectInitial } from '../state.js';
import { normalizeList, pickNode } from './shared.js';
export function Contract({ meta, children }) {
  const now = new Date().toISOString();
  const normMeta = { ...meta, generatedAt: meta.generatedAt ?? now };
  const nodes = normalizeList(children);
  const themeNode = pickNode(nodes, 'Theme');
  const navNode = pickNode(nodes, 'Navigation');
  if (!navNode) throw new Error('Contract: Navigation child is required');
  return {
    meta: normMeta,
    theme: themeNode?.value,
    navigation: navNode.value,
    initial: __collectInitial(),
  };
}
