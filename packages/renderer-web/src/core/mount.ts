import type { Action, Contract as ContractDocument, Scope } from '@bdui/common';

import { createActionRunner } from '../actions.js';
import { createNavigationController } from '../navigation.js';
import { createRuntimeStateController } from '../state.js';
import { createWebContext } from './context.js';
import { ensureDefaultStyles } from './defaultStyles.js';
import { createRouteRenderer } from './routes.js';

type MountOptions = { urlSync?: boolean; storageKey?: string };

export function mount(container: HTMLElement, contract: ContractDocument, opts: MountOptions = {}) {
  const doc = container.ownerDocument;
  ensureDefaultStyles(doc);
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

  const { renderNode } = createWebContext({
    document: doc,
    stateController,
    runActions: (actions?: Action[]) => actionRunner.runActions(actions),
  });

  const { renderRoute } = createRouteRenderer({
    document: doc,
    stateController,
    renderNode,
  });

  function renderCurrentRoute(): HTMLElement {
    const currentRoute = navigation.resolve(navigation.currentRoute);
    if (!currentRoute) {
      const el = doc.createElement('div');
      el.textContent = `Route not found: ${navigation.currentRoute}`;
      return el;
    }
    return renderRoute(currentRoute);
  }

  function rerender() {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderCurrentRoute());
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
    navigate(to: string) {
      actionRunner.runActions([{ type: 'navigate', params: { to } } as Action]);
    },
    setState(scope: Scope, path: string, value: unknown) {
      actionRunner.runActions([
        { type: 'set', params: { target: { scope, path }, value } } as Action,
      ]);
    },
    get state() {
      return stateController.state;
    },
    rerender,
  };
}
