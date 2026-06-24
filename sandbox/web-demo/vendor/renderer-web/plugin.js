import { getWebComponentRenderer } from '@bdui/defs';
import { evaluateGuard, interpolateTemplate, resolveFlowStep, } from '@bdui/runtime';
import { evaluate } from '@bdui/runtime';
import { cssForModifiers, formatValue, renderUnsupported } from './dom-utils.js';
import { captureFocus, restoreFocus } from './focus.js';
import { mountModalHost } from './modal-host.js';
import { ensureDefaultStyles } from './styles.js';
import { mountToastHost } from './toast-host.js';
function getCurrentRoute(ctx) {
    return ctx.navigation.resolve(ctx.navigation.currentRoute);
}
function findModalDescriptor(contract, id) {
    function visit(node) {
        if (!node)
            return undefined;
        if (node.id === id)
            return node;
        const children = node.children;
        if (!children)
            return undefined;
        for (const child of children) {
            const match = visit(child);
            if (match)
                return match;
        }
        return undefined;
    }
    for (const route of contract?.navigation.routes ?? []) {
        if (route.type === 'flow') {
            for (const step of route.steps) {
                for (const child of step.children) {
                    const match = visit(child);
                    if (match)
                        return match;
                }
            }
        }
        else {
            const match = visit(route.node);
            if (match)
                return match;
        }
    }
    return undefined;
}
export function createWebPlugin(options = {}) {
    const internal = {
        doc: null,
        container: null,
        context: null,
        rendererContext: null,
        disposers: [],
    };
    function renderNode(node) {
        const renderer = getWebComponentRenderer(node.type);
        if (!renderer || !internal.rendererContext) {
            return renderUnsupported(internal.doc, node);
        }
        return renderer({ node: node, context: internal.rendererContext });
    }
    function renderChildren(children) {
        if (!children || children.length === 0)
            return [];
        return children.map((child) => renderNode(child));
    }
    function createRendererContext(ctx) {
        return {
            document: internal.doc,
            state: ctx.state.snapshot(),
            runActions: (actions) => {
                void ctx.runActions(actions);
            },
            renderChild: (child) => renderNode(child),
            renderChildren: (children) => renderChildren(children),
            interpolate: (template) => interpolateTemplate(template, ctx.state.snapshot()),
            format: formatValue,
            resolve: (value) => evaluate(value, ctx.state.snapshot()),
            readAt: (scope, path) => ctx.state.read(scope, path),
            writeAt: (scope, path, value) => ctx.state.write(scope, path, value),
            utils: {
                cssForModifiers: (modifiers) => cssForModifiers(modifiers, (value) => evaluate(value, ctx.state.snapshot())),
            },
        };
    }
    function renderRoute(options = {}) {
        if (!internal.context)
            return;
        const focus = options.preserveFocus
            ? captureFocus(internal.doc, internal.container)
            : null;
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
        if (route.type === 'flow') {
            renderFlowRoute(route);
        }
        else {
            renderScreenRoute(route);
        }
        restoreFocus(internal.container, focus);
    }
    function renderScreenRoute(route) {
        if (!internal.context)
            return;
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
    function renderFlowRoute(route) {
        if (!internal.context)
            return;
        const stepKey = `__flow.${route.id}.current`;
        const currentStepId = internal.context.state.read('local', stepKey);
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
    function attachUrlSync(ctx) {
        if (typeof window === 'undefined')
            return;
        const sync = () => {
            const targetHash = `#${ctx.navigation.currentRoute}`;
            if (window.location.hash !== targetHash) {
                window.location.hash = ctx.navigation.currentRoute;
            }
        };
        const initialHash = window.location.hash.slice(1);
        if (initialHash)
            ctx.navigation.sync(initialHash);
        const onHashChange = () => {
            const nextRoute = window.location.hash.slice(1) || ctx.navigation.currentRoute;
            if (ctx.navigation.sync(nextRoute))
                renderRoute();
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
            if (options.urlSync)
                attachUrlSync(ctx);
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
                }
                catch {
                    /* ignore */
                }
            }
            internal.disposers.length = 0;
        },
    };
}
export const __evalGuard = evaluateGuard;
//# sourceMappingURL=plugin.js.map