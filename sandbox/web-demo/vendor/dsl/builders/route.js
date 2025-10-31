import { createNode, ensureComponentNode, normalizeList } from './shared.js';
export function Route({ id, title, path, cache, children }) {
  const nodes = normalizeList(children);
  const node = ensureComponentNode(nodes);
  const value = { id, title, path, cache, node };
  return createNode('Route', value);
}
