import { getWebComponentRenderer } from '@bdui/defs';
import { resolveFlowStep } from '@bdui/dsl';
import { createActionRunner } from './actions.js';
import { createNavigationController } from './navigation.js';
import { createRuntimeStateController } from './state.js';
function cssForModifiers(modifiers) {
  if (!modifiers) return {};
  const style = {};
  const entries = Object.entries(modifiers);
  for (const [key, value] of entries) {
    if (value == null) continue;
    switch (key) {
      case 'padding':
      case 'gap':
      case 'width':
      case 'height':
        style[key] = typeof value === 'number' ? `${value}px` : String(value);
        break;
      case 'align':
        style.alignItems = String(value);
        break;
      case 'justify':
        style.justifyContent = String(value);
        break;
      default:
        style[key] = String(value);
    }
  }
  return style;
}
function formatValue(value) {
  return value == null ? '' : String(value);
}
function renderUnsupportedNode(doc, node) {
  const el = doc.createElement('pre');
  el.textContent = '[Unsupported node] ' + JSON.stringify(node, null, 2);
  return el;
}
function isFlowRoute(route) {
  return route.type === 'flow';
}
export function mount(container, contract, opts = {}) {
  const doc = container.ownerDocument;
  const hasWindow = typeof window !== 'undefined';
  const urlSync = opts.urlSync ?? !!contract?.navigation?.urlSync;
  const storageKey =
    opts.storageKey ||
    `bdui_session_${contract?.meta?.appId || contract?.meta?.contractId || 'app'}`;
  const stateController = createRuntimeStateController(contract, storageKey);
  const navigation = createNavigationController(contract.navigation);
  const syncUrl = () => {
    if (!hasWindow || !urlSync) return;
    const targetHash = `#${navigation.currentRoute}`;
    if (window.location.hash !== targetHash) {
      window.location.hash = navigation.currentRoute;
    }
  };
  const actionRunner = createActionRunner({
    state: stateController,
    navigation,
    rerender,
    onRouteChange: syncUrl,
    showToast: (message) => {
      if (hasWindow && typeof window.alert === 'function') {
        window.alert(message);
      } else {
        console.log('[toast]', message);
      }
    },
  });
  let webContext;
  function renderNode(node) {
    const renderer = getWebComponentRenderer(node?.type);
    if (!renderer) {
      return renderUnsupportedNode(doc, node);
    }
    return renderer({
      node,
      context: webContext,
    });
  }
  webContext = {
    document: doc,
    state: stateController.state,
    runActions: (actions) => actionRunner.runActions(actions),
    renderChild: (child) => renderNode(child),
    renderChildren: (children) => (children ?? []).map((child) => renderNode(child)),
    interpolate: (template) => stateController.interpolate(template),
    format: formatValue,
    utils: {
      cssForModifiers,
    },
  };
  function renderFlowRoute(route) {
    const stepKey = `__flow.${route.id}.current`;
    const currentStepId = stateController.get('local', stepKey);
    const resolution = resolveFlowStep(route, stateController.state, currentStepId);
    if (resolution.stepId !== currentStepId) {
      stateController.set('local', stepKey, resolution.stepId);
    }
    const wrapper = doc.createElement('div');
    const title = doc.createElement('h2');
    title.textContent = resolution.step.title || route.title || route.id;
    wrapper.appendChild(title);
    for (const child of resolution.step.children || []) {
      wrapper.appendChild(renderNode(child));
    }
    return wrapper;
  }
  function renderScreenRoute(route) {
    const wrapper = doc.createElement('div');
    const title = doc.createElement('h2');
    title.textContent = route.title || route.id;
    wrapper.appendChild(title);
    if (route.node) {
      wrapper.appendChild(renderNode(route.node));
    }
    return wrapper;
  }
  function renderRoute() {
    const currentRoute = navigation.resolve(navigation.currentRoute);
    if (!currentRoute) {
      const el = doc.createElement('div');
      el.textContent = `Route not found: ${navigation.currentRoute}`;
      return el;
    }
    return isFlowRoute(currentRoute)
      ? renderFlowRoute(currentRoute)
      : renderScreenRoute(currentRoute);
  }
  function rerender() {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderRoute());
  }
  if (hasWindow && urlSync) {
    const initialHash = window.location.hash.slice(1);
    if (initialHash) {
      navigation.sync(initialHash);
    }
    const onHashChange = () => {
      const nextRoute = window.location.hash.slice(1) || contract?.navigation?.initialRoute;
      if (navigation.sync(nextRoute)) {
        rerender();
      }
    };
    window.addEventListener('hashchange', onHashChange);
  }
  rerender();
  syncUrl();
  return {
    navigate(to) {
      actionRunner.runActions([{ type: 'navigate', params: { to } }]);
    },
    setState(scope, path, value) {
      actionRunner.runActions([{ type: 'set', params: { target: { scope, path }, value } }]);
    },
    get state() {
      return stateController.state;
    },
    rerender,
  };
}
