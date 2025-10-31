import type { AppRoute, FlowRouteScreen, RouteScreen } from '@bdui/common';
import type { ComponentNode } from '@bdui/defs';
import { resolveFlowStep } from '@bdui/dsl';

import type { RuntimeStateController } from '../state.js';
import { isFlowRoute } from './helpers.js';

type RouteRendererDeps = {
  document: Document;
  stateController: RuntimeStateController;
  renderNode(node: ComponentNode): HTMLElement;
};

export function createRouteRenderer({ document, stateController, renderNode }: RouteRendererDeps) {
  function renderFlowRoute(route: FlowRouteScreen): HTMLElement {
    const stepKey = `__flow.${route.id}.current`;
    const currentStepId = stateController.get('local', stepKey) as string | undefined;
    const resolution = resolveFlowStep(route, stateController.state, currentStepId);
    if (resolution.stepId !== currentStepId) {
      stateController.set('local', stepKey, resolution.stepId);
    }

    const wrapper = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = resolution.step.title || route.title || route.id;
    wrapper.appendChild(title);
    for (const child of resolution.step.children || []) {
      wrapper.appendChild(renderNode(child as ComponentNode));
    }
    return wrapper;
  }

  function renderScreenRoute(route: RouteScreen): HTMLElement {
    const wrapper = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = route.title || route.id;
    wrapper.appendChild(title);
    if (route.node) {
      wrapper.appendChild(renderNode(route.node as ComponentNode));
    }
    return wrapper;
  }

  function renderRoute(route: AppRoute): HTMLElement {
    return isFlowRoute(route) ? renderFlowRoute(route) : renderScreenRoute(route as RouteScreen);
  }

  return { renderRoute, renderFlowRoute, renderScreenRoute } as const;
}
