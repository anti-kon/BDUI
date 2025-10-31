import type {
  AnyDslNode,
  AppRoute,
  FlowRouteScreen,
  NavigationType,
  RouteScreen,
} from './shared.js';
import { createNode, normalizeList } from './shared.js';

type NavigationProps = {
  initialRoute: string;
  urlSync?: boolean;
  children?: AnyDslNode | AnyDslNode[] | null | undefined | false;
};

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
