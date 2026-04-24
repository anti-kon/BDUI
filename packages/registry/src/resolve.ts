import type {
  AppRoute,
  Contract,
  FlowRouteScreen,
  FlowStep,
  RouteScreen,
  RuntimeStateLike,
} from '@bdui/core';
import { resolveFlowStep } from '@bdui/runtime';

export type ResolvedRoute =
  | { readonly type: 'screen'; readonly route: RouteScreen; readonly node: RouteScreen['node'] }
  | {
      readonly type: 'flow';
      readonly route: FlowRouteScreen;
      readonly stepId: string;
      readonly step: FlowStep;
    };

function isFlowRoute(route: AppRoute): route is FlowRouteScreen {
  return (route as FlowRouteScreen).type === 'flow';
}

export function resolveRouteNode(
  contract: Contract,
  routeId: string,
  state: RuntimeStateLike = {},
  currentStepId?: string,
): ResolvedRoute {
  const navigation = contract.navigation;
  const routes = navigation?.routes ?? [];
  const route = routes.find((r) => r.id === routeId);
  if (!route) throw new Error(`Route not found: ${routeId}`);
  if (!isFlowRoute(route)) {
    const screenRoute = route as RouteScreen;
    return { type: 'screen', route: screenRoute, node: screenRoute.node };
  }
  const { step, stepId } = resolveFlowStep(route, state, currentStepId);
  return { type: 'flow', route, stepId, step };
}
