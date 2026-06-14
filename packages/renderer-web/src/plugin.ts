import type {
  Action,
  AppRoute,
  BDUIElement,
  Contract,
  FlowRouteScreen,
  RouteScreen,
} from '@bdui/core';
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
  readonly contract?: Contract;
}

interface WebPluginState {
  doc: Document;
  container: HTMLElement;
  context: RendererPluginContext | null;
  rendererContext: WebRendererContext | null;
  disposers: Array<() => void>;
}

interface FocusSnapshot {
  readonly index: number;
  readonly selectionStart?: number | null;
  readonly selectionEnd?: number | null;
}

const FOCUSABLE_SELECTOR = 'input, textarea, select, button, [tabindex]:not([tabindex="-1"])';

function getCurrentRoute(ctx: RendererPluginContext): AppRoute | undefined {
  return ctx.navigation.resolve(ctx.navigation.currentRoute);
}

function findModalDescriptor(contract: Contract | undefined, id: string): BDUIElement | undefined {
  function visit(node: BDUIElement | undefined): BDUIElement | undefined {
    if (!node) return undefined;
    if ((node as { id?: unknown }).id === id) return node;
    const children = (node as { children?: readonly BDUIElement[] }).children;
    if (!children) return undefined;
    for (const child of children) {
      const match = visit(child);
      if (match) return match;
    }
    return undefined;
  }

  for (const route of contract?.navigation.routes ?? []) {
    if ((route as FlowRouteScreen).type === 'flow') {
      for (const step of (route as FlowRouteScreen).steps) {
        for (const child of step.children) {
          const match = visit(child);
          if (match) return match;
        }
      }
    } else {
      const match = visit((route as RouteScreen).node);
      if (match) return match;
    }
  }
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

  function focusableElements(): HTMLElement[] {
    return Array.from(internal.container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (element) => !element.hasAttribute('disabled'),
    );
  }

  function captureFocus(): FocusSnapshot | null {
    const active = internal.doc.activeElement;
    if (!(active instanceof internal.doc.defaultView!.HTMLElement)) return null;
    if (!internal.container.contains(active)) return null;
    const elements = focusableElements();
    const index = elements.indexOf(active);
    if (index < 0) return null;

    const control = active as HTMLInputElement | HTMLTextAreaElement;
    let selectionStart: number | null | undefined;
    let selectionEnd: number | null | undefined;
    try {
      selectionStart = control.selectionStart;
      selectionEnd = control.selectionEnd;
    } catch {
      selectionStart = undefined;
      selectionEnd = undefined;
    }
    return { index, selectionStart, selectionEnd };
  }

  function restoreFocus(snapshot: FocusSnapshot | null): void {
    if (!snapshot) return;
    const target = focusableElements()[snapshot.index];
    if (!target) return;
    try {
      target.focus({ preventScroll: true });
    } catch {
      target.focus();
    }
    if (
      snapshot.selectionStart != null &&
      snapshot.selectionEnd != null &&
      'setSelectionRange' in target
    ) {
      try {
        (target as HTMLInputElement | HTMLTextAreaElement).setSelectionRange(
          snapshot.selectionStart,
          snapshot.selectionEnd,
        );
      } catch {
        /* ignore controls that do not support text selections */
      }
    }
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
      utils: {
        cssForModifiers: (modifiers) =>
          cssForModifiers(modifiers, (value) => evaluate(value as never, ctx.state.snapshot())),
      },
    };
  }

  function renderRoute(options: { preserveFocus?: boolean } = {}): void {
    if (!internal.context) return;
    const focus = options.preserveFocus ? captureFocus() : null;
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
    restoreFocus(focus);
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
      return;
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

      const unsubState = ctx.state.on('change', () => renderRoute({ preserveFocus: true }));
      const unsubRoute = ctx.navigation.on('change', () => renderRoute());
      internal.disposers.push(unsubState, unsubRoute);

      const unsubToast = mountToastHost(internal.doc, ctx.toast);
      const unsubModal = mountModalHost(internal.doc, ctx.modal, {
        renderNode: (node) => renderNode(node),
        lookupModal: (id) => findModalDescriptor(options.contract, id),
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
