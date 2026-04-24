import type {
  AppRoute,
  FlowRouteScreen,
  Navigation as NavigationType,
  RouteScreen,
} from '@bdui/core';

import type { AnyDslNode } from './shared.js';
import { createNode, normalizeList } from './shared.js';

export interface NavigationProps {
  initialRoute: string;
  urlSync?: boolean;
  children?: AnyDslNode | readonly AnyDslNode[] | null | undefined | false;
}

export function Navigation({ initialRoute, urlSync, children }: NavigationProps) {
  const nodes = normalizeList<AnyDslNode>(children);

  const routes: AppRoute[] = nodes
    .filter(
      (
        node,
      ): node is AnyDslNode &
        (
          | { __kind: 'Route'; value: RouteScreen }
          | { __kind: 'FlowRoute'; value: FlowRouteScreen }
        ) => node?.__kind === 'Route' || node?.__kind === 'FlowRoute',
    )
    .map((node) => node.value as AppRoute);

  const nav: NavigationType = { initialRoute, urlSync, routes };
  return createNode('Navigation', nav);
}
