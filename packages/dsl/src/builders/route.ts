import type { BDUIElement, RouteScreen } from '@bdui/core';

import { createNode, ensureComponentNode, type Maybe, normalizeList } from './shared.js';

export interface RouteProps {
  id: string;
  title?: string;
  path?: string;
  cache?: Readonly<Record<string, unknown>>;
  children?: Maybe<BDUIElement | readonly BDUIElement[]>;
}

export function Route({ id, title, path, cache, children }: RouteProps) {
  const nodes = normalizeList<BDUIElement>(children);
  const node = ensureComponentNode(nodes);
  const value: RouteScreen = { id, title, path, cache, node };
  return createNode('Route', value);
}
