import { E } from './expr.js';
let activeCollector = null;
const moduleDefaults = {
    flow: {},
    session: {},
};
export function createStateCollector() {
    const flow = {};
    const session = {};
    return {
        declare(scope, name, value) {
            if (value === undefined)
                return;
            if (scope === 'flow')
                flow[name] = clone(value);
            else if (scope === 'session')
                session[name] = clone(value);
            // 'local' scope has no declared defaults.
        },
        snapshot() {
            return {
                flow: { ...clone(moduleDefaults.flow), ...clone(flow) },
                session: { ...clone(moduleDefaults.session), ...clone(session) },
            };
        },
    };
}
export function withStateCollector(collector, fn) {
    const prev = activeCollector;
    activeCollector = collector;
    try {
        return fn();
    }
    finally {
        activeCollector = prev;
    }
}
/**
 * Clears module-level default accumulator. Exposed for tests and tools that
 * build several independent contracts in the same process.
 */
export function resetModuleDefaults() {
    moduleDefaults.flow = {};
    moduleDefaults.session = {};
}
function declareVar(scope, name, initialValue) {
    if (activeCollector) {
        activeCollector.declare(scope, name, initialValue);
    }
    if (scope === 'flow' || scope === 'session') {
        moduleDefaults[scope][name] = clone(initialValue);
    }
}
function clone(value) {
    const sc = globalThis.structuredClone;
    if (typeof sc === 'function')
        return sc(value);
    return JSON.parse(JSON.stringify(value));
}
function makeVar(scope, name, initialValue) {
    if (!name || typeof name !== 'string') {
        throw new Error('State variable name must be a non-empty string');
    }
    if (initialValue !== undefined && (scope === 'flow' || scope === 'session')) {
        declareVar(scope, name, initialValue);
    }
    return { __var: true, scope, name, path: name, initialValue };
}
export function Flow(name, initialValue) {
    return makeVar('flow', name, initialValue);
}
export function Session(name, initialValue) {
    return makeVar('session', name, initialValue);
}
export function Local(name) {
    return makeVar('local', name);
}
/** Produce an expression referencing the state var. */
export function use(v) {
    return E(`${v.scope}.${v.path}`);
}
/** Produce a two-way binding descriptor. */
export function bind(v) {
    return { scope: v.scope, path: v.path };
}
export function isStateVar(value) {
    return (typeof value === 'object' &&
        value !== null &&
        value.__var === true &&
        typeof value.scope === 'string' &&
        typeof value.path === 'string');
}
//# sourceMappingURL=state.js.map