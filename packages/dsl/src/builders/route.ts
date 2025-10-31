import type { BDUIElement, RouteScreen } from './shared.js';
import { createNode, ensureComponentNode, type Maybe, normalizeList } from './shared.js';

type RouteProps = {
  id: string;
  title?: string;
  path?: string;
  cache?: Record<string, unknown>;
  children?: Maybe<BDUIElement | BDUIElement[]>;
};

export function Route({ id, title, path, cache, children }: RouteProps) {
  const nodes = normalizeList<BDUIElement>(children);
  const node = ensureComponentNode(nodes);
  const value: RouteScreen = { id, title, path, cache, node };
  return createNode('Route', value);
}
