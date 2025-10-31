import type {
  AppRoute,
  FlowRouteScreen,
  FlowStep,
  Navigation as NavigationConfig,
  RouteScreen,
  RuntimeStateLike,
} from '@bdui/common';
import { resolveFlowStep } from '@bdui/dsl';

export type FlowEngineState = RuntimeStateLike;

export type ResolvedRoute =
  | { type: 'screen'; route: RouteScreen; node: RouteScreen['node'] }
  | { type: 'flow'; route: FlowRouteScreen; stepId: string; step: FlowStep };

function isFlowRoute(route: AppRoute): route is FlowRouteScreen {
  return (route as FlowRouteScreen).type === 'flow';
}

export function resolveRouteNode(
  contract: { navigation?: NavigationConfig },
  routeId: string,
  state: FlowEngineState = {},
  currentStepId?: string,
): ResolvedRoute {
  const navigation = contract?.navigation;
  const routes = navigation?.routes ?? [];
  const route = routes.find((r: AppRoute) => r.id === routeId);
  if (!route) throw new Error(`Route not found: ${routeId}`);

  if (!isFlowRoute(route)) {
    const screenRoute = route as RouteScreen;
    return { type: 'screen', route: screenRoute, node: screenRoute.node };
  }

  const { step, stepId } = resolveFlowStep(route, state, currentStepId);
  return { type: 'flow', route, stepId, step };
}
