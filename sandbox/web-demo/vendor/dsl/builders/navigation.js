import { createNode, normalizeList } from './shared.js';
export function Navigation({ initialRoute, urlSync, children }) {
  const nodes = normalizeList(children);
  const routes = nodes
    .filter((node) => node?.__kind === 'Route' || node?.__kind === 'FlowRoute')
    .map((node) => node.value);
  const nav = { initialRoute, urlSync, routes };
  return createNode('Navigation', nav);
}
