import { E } from './expr.js';
const initial = { flow: {}, session: {} };
function cloneInitial(value) {
  const structured = globalThis.structuredClone;
  if (typeof structured === 'function') {
    return structured(value);
  }
  return JSON.parse(JSON.stringify(value));
}
function makeVar(scope, name, initialValue) {
  if ((scope === 'flow' || scope === 'session') && initialValue !== undefined) {
    initial[scope][name] = initialValue;
  }
  return { scope, path: name, name };
}
export function Flow(name, initialValue) {
  return Object.assign(makeVar('flow', name, initialValue), { _kind: 'flow' });
}
export function Session(name, initialValue) {
  return Object.assign(makeVar('session', name, initialValue), { _kind: 'session' });
}
export function Local(name) {
  return Object.assign(makeVar('local', name), { _kind: 'local' });
}
export function use(v) {
  return E(`${v.scope}.${v.path}`);
}
export function __collectInitial() {
  const snapshot = {
    flow: cloneInitial(initial.flow),
    session: cloneInitial(initial.session),
  };
  return snapshot;
}
