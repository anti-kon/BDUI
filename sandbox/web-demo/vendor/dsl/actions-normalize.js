const SCOPES = ['local', 'session', 'flow'];
function isScope(value) {
  return typeof value === 'string' && SCOPES.includes(value);
}
function ensurePath(path) {
  if (typeof path !== 'string' || !path.trim()) {
    throw new Error('Target path must be a non-empty string');
  }
  return path;
}
function parseTarget(target) {
  if (typeof target === 'string') {
    const [scopeCandidate, ...rest] = target.split('.');
    if (!scopeCandidate || rest.length === 0) {
      throw new Error(`Invalid string target: "${target}"`);
    }
    if (!isScope(scopeCandidate)) {
      throw new Error(`Unsupported scope: "${scopeCandidate}"`);
    }
    const path = ensurePath(rest.join('.'));
    return { scope: scopeCandidate, path };
  }
  const scope = target?.scope;
  const path = target?.path;
  if (!isScope(scope)) {
    throw new Error(`Unsupported scope: "${String(scope)}"`);
  }
  return { scope, path: ensurePath(path) };
}
function isVar(x) {
  return x && typeof x === 'object' && typeof x.scope === 'string' && typeof x.path === 'string';
}
function isFullAction(a) {
  return a && typeof a === 'object' && typeof a.type === 'string';
}
function fnToString(f) {
  return String(f);
}
function normOne(literal) {
  if (isFullAction(literal)) return literal;
  if (!literal || typeof literal !== 'object') {
    throw new Error('Unknown action literal: ' + JSON.stringify(literal));
  }
  if ('set' in literal) {
    const [target, value] = literal.set;
    return { type: 'set', params: { target: parseTarget(target), value } };
  }
  if ('setVar' in literal) {
    const [vref, value] = literal.setVar;
    if (isVar(vref)) {
      return { type: 'set', params: { target: parseTarget(vref), value } };
    }
  }
  if ('update' in literal) {
    const [vref, reducer] = literal.update;
    if (isVar(vref)) {
      return {
        type: 'update',
        params: { target: parseTarget(vref), reducer: fnToString(reducer) },
      };
    }
  }
  if ('navigate' in literal) {
    const [to, opts] = literal.navigate;
    return { type: 'navigate', params: { to, ...(opts || {}) } };
  }
  if ('back' in literal) return { type: 'back' };
  if ('replace' in literal) return { type: 'replace', params: { to: literal.replace } };
  if ('popToRoot' in literal) return { type: 'popToRoot' };
  if ('fetch' in literal) return { type: 'fetch', params: { sourceId: literal.fetch } };
  if ('call' in literal) {
    const call = literal.call;
    const action = {
      type: 'callApi',
      params: {
        url: call.url,
        method: call.method,
        body: call.body,
        saveTo: call.saveTo,
      },
      rollbackAction: call.rollback ? normOne(call.rollback) : undefined,
    };
    return action;
  }
  if ('toast' in literal) {
    const [message, opts] = literal.toast;
    return { type: 'toast', params: { message, ...(opts || {}) } };
  }
  if ('sync' in literal) {
    return { type: 'sync', params: literal.sync };
  }
  if ('validate' in literal) {
    const [schemaRef, target] = literal.validate;
    return { type: 'validate', params: { schemaRef, target: parseTarget(target) } };
  }
  throw new Error('Unknown action literal: ' + JSON.stringify(literal));
}
function asArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}
export function normalizeActions(input) {
  if (input == null) return [];
  return asArray(input).map((item) => normOne(item));
}
