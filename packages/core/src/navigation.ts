import type { FlowRouteScreen } from './flow.js';
import type { BDUIElement } from './node.js';

export interface RouteScreen {
  readonly id: string;
  readonly title?: string;
  readonly path?: string;
  readonly cache?: Readonly<Record<string, unknown>>;
  readonly node: BDUIElement;
}

export type AppRoute = RouteScreen | FlowRouteScreen;

export interface Navigation {
  readonly initialRoute: string;
  readonly urlSync?: boolean;
  readonly routes: readonly AppRoute[];
}

export function isFlowRoute(route: AppRoute): route is FlowRouteScreen {
  return (route as { type?: unknown }).type === 'flow';
}

export function isScreenRoute(route: AppRoute): route is RouteScreen {
  return !isFlowRoute(route);
}
