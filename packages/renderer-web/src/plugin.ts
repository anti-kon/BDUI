import type { Action, AppRoute, BDUIElement, FlowRouteScreen, RouteScreen } from '@bdui/core';
import type { ComponentNode, WebRendererContext } from '@bdui/defs';
import { getWebComponentRenderer } from '@bdui/defs';
import {
  evaluateGuard,
  interpolateTemplate,
  type RendererPlugin,
  type RendererPluginContext,
  resolveFlowStep,
} from '@bdui/runtime';
import { evaluate } from '@bdui/runtime';

import { cssForModifiers, formatValue, renderUnsupported } from './dom-utils.js';
import { mountModalHost } from './modal-host.js';
import { ensureDefaultStyles } from './styles.js';
import { mountToastHost } from './toast-host.js';

export interface WebPluginOptions {
  readonly urlSync?: boolean;
}

interface WebPluginState {
  doc: Document;
  container: HTMLElement;
  context: RendererPluginContext | null;
  rendererContext: WebRendererContext | null;
  disposers: Array<() => void>;
}

function getCurrentRoute(ctx: RendererPluginContext): AppRoute | undefined {
  return ctx.navigation.resolve(ctx.navigation.currentRoute);
}

function findModalDescriptor(
  contract: Parameters<RendererPlugin['mount']>[1],
  _id: string,
): BDUIElement | undefined {
  // Modal descriptors live in the tree; runtime does not track them separately.
  // For now, return undefined; applications can subscribe to modal events
  // themselves to render custom content.
  void contract;
  return undefined;
}

export function createWebPlugin(options: WebPluginOptions = {}): RendererPlugin<HTMLElement> {
  const internal: WebPluginState = {
    doc: null as unknown as Document,
    container: null as unknown as HTMLElement,
    context: null,
    rendererContext: null,
    disposers: [],
  };

  function renderNode(node: BDUIElement | ComponentNode): HTMLElement {
    const renderer = getWebComponentRenderer((node as ComponentNode).type);
    if (!renderer || !internal.rendererContext) {
      return renderUnsupported(internal.doc, node);
    }
    return renderer({ node: node as ComponentNode, context: internal.rendererContext });
  }

  function renderChildren(children?: readonly ComponentNode[]): HTMLElement[] {
    if (!children || children.length === 0) return [];
    return children.map((child) => renderNode(child));
  }

  function createRendererContext(ctx: RendererPluginContext): WebRendererContext {
    return {
      document: internal.doc,
      state: ctx.state.snapshot(),
      runActions: (actions) => {
        void ctx.runActions(actions as unknown as readonly unknown[] | undefined);
      },
      renderChild: (child) => renderNode(child),
      renderChildren: (children) => renderChildren(children),
      interpolate: (template: string) => interpolateTemplate(template, ctx.state.snapshot()),
      format: formatValue,
      resolve: <T>(value: unknown) => evaluate(value as never, ctx.state.snapshot()) as T,
      readAt: (scope, path) => ctx.state.read(scope, path),
      writeAt: (scope, path, value) => ctx.state.write(scope, path, value),
      utils: { cssForModifiers },
    };
  }

  function renderRoute(): void {
    if (!internal.context) return;
    while (internal.container.firstChild) {
      internal.container.removeChild(internal.container.firstChild);
    }
    const route = getCurrentRoute(internal.context);
    if (!route) {
      const notFound = internal.doc.createElement('div');
      notFound.textContent = `Route not found: ${internal.context.navigation.currentRoute}`;
      internal.container.appendChild(notFound);
      return;
    }
    if ((route as FlowRouteScreen).type === 'flow') {
      renderFlowRoute(route as FlowRouteScreen);
    } else {
      renderScreenRoute(route as RouteScreen);
    }
  }

  function renderScreenRoute(route: RouteScreen): void {
    if (!internal.context) return;
    internal.rendererContext = createRendererContext(internal.context);
    const wrapper = internal.doc.createElement('div');
    if (route.title) {
      const heading = internal.doc.createElement('h2');
      heading.textContent = route.title;
      wrapper.appendChild(heading);
    }
    wrapper.appendChild(renderNode(route.node));
    internal.container.appendChild(wrapper);
  }

  function renderFlowRoute(route: FlowRouteScreen): void {
    if (!internal.context) return;
    const stepKey = `__flow.${route.id}.current`;
    const currentStepId = internal.context.state.read('local', stepKey) as string | undefined;
    const resolution = resolveFlowStep(route, internal.context.state.snapshot(), currentStepId);
    if (resolution.stepId !== currentStepId) {
      internal.context.state.write('local', stepKey, resolution.stepId);
    }
    internal.rendererContext = createRendererContext(internal.context);
    const wrapper = internal.doc.createElement('div');
    const title = internal.doc.createElement('h2');
    title.textContent = resolution.step.title || route.title || route.id;
    wrapper.appendChild(title);
    for (const child of resolution.step.children) {
      wrapper.appendChild(renderNode(child));
    }
    internal.container.appendChild(wrapper);
  }

  function attachUrlSync(ctx: RendererPluginContext): void {
    if (typeof window === 'undefined') return;
    const sync = () => {
      const targetHash = `#${ctx.navigation.currentRoute}`;
      if (window.location.hash !== targetHash) {
        window.location.hash = ctx.navigation.currentRoute;
      }
    };
    const initialHash = window.location.hash.slice(1);
    if (initialHash) ctx.navigation.sync(initialHash);
    const onHashChange = () => {
      const nextRoute = window.location.hash.slice(1) || ctx.navigation.currentRoute;
      if (ctx.navigation.sync(nextRoute)) renderRoute();
    };
    window.addEventListener('hashchange', onHashChange);
    internal.disposers.push(() => window.removeEventListener('hashchange', onHashChange));
    const unsubNav = ctx.navigation.on('change', () => sync());
    internal.disposers.push(unsubNav);
    sync();
  }

  return {
    name: 'dom',
    mount(container, ctx) {
      internal.container = container;
      internal.doc = container.ownerDocument;
      internal.context = ctx;
      ensureDefaultStyles(internal.doc);

      const unsubState = ctx.state.on('change', () => renderRoute());
      const unsubRoute = ctx.navigation.on('change', () => renderRoute());
      internal.disposers.push(unsubState, unsubRoute);

      const unsubToast = mountToastHost(internal.doc, ctx.toast);
      const unsubModal = mountModalHost(internal.doc, ctx.modal, {
        renderNode: (node) => renderNode(node),
        lookupModal: (id) =>
          findModalDescriptor(ctx as unknown as Parameters<RendererPlugin['mount']>[1], id),
      });
      internal.disposers.push(unsubToast, unsubModal);

      if (options.urlSync) attachUrlSync(ctx);

      renderRoute();
    },
    renderScreen(route, ctx) {
      internal.context = ctx;
      renderScreenRoute(route);
    },
    renderFlow(route, ctx) {
      internal.context = ctx;
      renderFlowRoute(route);
    },
    renderNode(node, ctx) {
      internal.context = ctx;
      return renderNode(node);
    },
    unmount() {
      for (const dispose of internal.disposers) {
        try {
          dispose();
        } catch {
          /* ignore */
        }
      }
      internal.disposers.length = 0;
    },
  };
}

type _keepSymbols = [Action, BDUIElement, (cond: unknown) => void];
export const __evalGuard = evaluateGuard;
