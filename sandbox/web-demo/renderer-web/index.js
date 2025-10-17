function deepGet(obj, path) {
  const parts = path.split('.').filter(Boolean);
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}
function deepSet(obj, path, value) {
  const parts = path.split('.').filter(Boolean);
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (!cur[k] || typeof cur[k] !== 'object') cur[k] = {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
}
function evalExpr(code, state) {
  const body = `return (${code});`;
  return Function('flow', 'session', 'local', body)(state.flow, state.session, state.local);
}
function interpolate(text, state) {
  return text.replace(/\{\{([^}]+)\}\}/g, (_, expr) => {
    try {
      const v = evalExpr(expr, state);
      return v == null ? '' : String(v);
    } catch {
      return '';
    }
  });
}
function cssForModifiers(mod) {
  const s = {};
  if (!mod) return s;
  if (mod.padding != null)
    s.padding = typeof mod.padding === 'number' ? mod.padding + 'px' : String(mod.padding);
  if (mod.gap != null) s.gap = typeof mod.gap === 'number' ? mod.gap + 'px' : String(mod.gap);
  if (mod.align) s.alignItems = String(mod.align);
  if (mod.justify) s.justifyContent = String(mod.justify);
  return s;
}
export function mount(container, contract, opts = {}) {
  const urlSync = opts.urlSync ?? !!contract?.navigation?.urlSync;
  const storageKey =
    opts.storageKey ||
    `bdui_session_${contract?.meta?.appId || contract?.meta?.contractId || 'app'}`;
  const state = {
    flow: structuredClone(contract?.initial?.flow || {}),
    session: (() => {
      try {
        const raw = localStorage.getItem(storageKey);
        return raw ? JSON.parse(raw) : contract?.initial?.session || {};
      } catch {
        return contract?.initial?.session || {};
      }
    })(),
    local: {},
  };
  const historyStack = [];
  let currentRoute = contract?.navigation?.initialRoute;
  if (urlSync && location.hash.slice(1)) currentRoute = location.hash.slice(1);
  function syncUrl() {
    if (urlSync) location.hash = currentRoute;
  }
  function saveSession() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state.session));
    } catch {}
  }
  function runActions(actions) {
    if (!actions) return;
    for (const a of actions) runAction(a);
  }
  function runAction(a) {
    switch (a?.type) {
      case 'set': {
        const { target, value } = a.params || {};
        const scope = target.scope;
        deepSet(state[scope], target.path, value);
        if (scope === 'session') saveSession();
        rerender();
        break;
      }
      case 'update': {
        const { target, reducer } = a.params || {};
        const scope = target.scope;
        let prev = deepGet(state[scope], target.path);
        let fn;
        try {
          fn = eval(reducer);
        } catch {
          fn = (x) => x;
        }
        const next = fn(prev);
        deepSet(state[scope], target.path, next);
        if (scope === 'session') saveSession();
        rerender();
        break;
      }
      case 'navigate': {
        const to = a.params?.to;
        const mode = a.params?.mode || 'push';
        if (mode === 'push') historyStack.push(currentRoute);
        currentRoute = to;
        syncUrl();
        rerender();
        break;
      }
      case 'back': {
        const prev = historyStack.pop();
        if (prev) currentRoute = prev;
        syncUrl();
        rerender();
        break;
      }
      case 'replace': {
        currentRoute = a.params?.to;
        syncUrl();
        rerender();
        break;
      }
      case 'popToRoot': {
        currentRoute = contract?.navigation?.initialRoute;
        historyStack.length = 0;
        syncUrl();
        rerender();
        break;
      }
      case 'toast': {
        alert(a.params?.message || '');
        break;
      }
      default: {
        break;
      }
    }
  }
  function resolveFlowStep(route) {
    const steps = route.steps || [];
    const idToStep = new Map(steps.map((s) => [s.id, s]));
    const key = `__flow.${route.id}.current`;
    let stepId = deepGet(state.local, key) || route.startStep;
    let step = idToStep.get(stepId) || steps[0];
    const transitions = step?.transitions || [];
    for (const t of transitions) {
      if (!t.guard) {
        stepId = t.to;
        break;
      }
      try {
        if (evalExpr(t.guard, state)) {
          stepId = t.to;
          break;
        }
      } catch {}
    }
    if (stepId !== step?.id) {
      step = idToStep.get(stepId) || step;
      deepSet(state.local, key, stepId);
    }
    return step;
  }
  function renderNode(node) {
    switch (node?.type) {
      case 'Row': {
        const el = document.createElement('div');
        Object.assign(
          el.style,
          { display: 'flex', flexDirection: 'row' },
          cssForModifiers(node.modifiers),
        );
        (node.children || []).forEach((ch) => el.appendChild(renderNode(ch)));
        return el;
      }
      case 'Column': {
        const el = document.createElement('div');
        Object.assign(
          el.style,
          { display: 'flex', flexDirection: 'column' },
          cssForModifiers(node.modifiers),
        );
        (node.children || []).forEach((ch) => el.appendChild(renderNode(ch)));
        return el;
      }
      case 'Text': {
        const el = document.createElement('div');
        const raw = node.text ?? '';
        el.textContent = typeof raw === 'string' ? interpolate(raw, state) : String(raw ?? '');
        Object.assign(el.style, cssForModifiers(node.modifiers));
        return el;
      }
      case 'Button': {
        const el = document.createElement('button');
        el.textContent = String(node.title ?? 'Button');
        el.disabled = !!node.disabled;
        el.onclick = () => runActions(node.onAction);
        // simple styles
        el.style.padding = '8px 12px';
        el.style.cursor = 'pointer';
        el.style.borderRadius = '8px';
        el.style.border = '1px solid #e5e7eb';
        el.style.background = node.modifiers?.variant === 'primary' ? '#4F46E5' : '#f3f4f6';
        el.style.color = node.modifiers?.variant === 'primary' ? '#fff' : '#111827';
        return el;
      }
      default: {
        const el = document.createElement('pre');
        el.textContent = '[Unsupported node] ' + JSON.stringify(node, null, 2);
        return el;
      }
    }
  }
  function renderRoute() {
    const route = (contract?.navigation?.routes || []).find((r) => r.id === currentRoute);
    if (!route) {
      const el = document.createElement('div');
      el.textContent = `Route not found: ${currentRoute}`;
      return el;
    }
    if (route.type === 'flow') {
      const step = resolveFlowStep(route);
      const wrap = document.createElement('div');
      const title = document.createElement('h2');
      title.textContent = step?.title || route.title || route.id;
      wrap.appendChild(title);
      (step?.children || []).forEach((ch) => wrap.appendChild(renderNode(ch)));
      return wrap;
    } else {
      const wrap = document.createElement('div');
      const title = document.createElement('h2');
      title.textContent = route.title || route.id;
      wrap.appendChild(title);
      if (route.node) wrap.appendChild(renderNode(route.node));
      return wrap;
    }
  }
  function rerender() {
    container.innerHTML = '';
    container.appendChild(renderRoute());
  }
  window.addEventListener('hashchange', () => {
    if (!urlSync) return;
    currentRoute = location.hash.slice(1) || contract?.navigation?.initialRoute;
    rerender();
  });
  rerender();
  return {
    navigate(to) {
      runAction({ type: 'navigate', params: { to } });
    },
    setState(scope, path, value) {
      runAction({ type: 'set', params: { target: { scope, path }, value } });
    },
    get state() {
      return state;
    },
    rerender,
  };
}
