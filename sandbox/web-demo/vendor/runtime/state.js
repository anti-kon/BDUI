import { EventBus } from './events.js';
import { deepGet, deepSet } from './path.js';
import { MemoryStorageAdapter } from './storage.js';
function cloneRecord(record) {
    if (!record)
        return {};
    return JSON.parse(JSON.stringify(record));
}
export function createRuntimeStateController(options) {
    const storage = options.storage ?? new MemoryStorageAdapter();
    const sessionKey = options.sessionKey ||
        `bdui_session_${options.contract.meta.appId || options.contract.meta.contractId}`;
    const initialFlow = cloneRecord(options.contract.initial?.flow);
    const initialSession = cloneRecord(options.contract.initial?.session);
    let sessionState = (() => {
        const raw = storage.getItem(sessionKey);
        if (!raw)
            return initialSession;
        try {
            return JSON.parse(raw);
        }
        catch {
            return initialSession;
        }
    })();
    let flowState = initialFlow;
    let localState = {};
    let paramsState = {};
    const bus = new EventBus();
    function persistSession() {
        try {
            storage.setItem(sessionKey, JSON.stringify(sessionState));
        }
        catch {
            /* ignore */
        }
    }
    function read(scope, path) {
        switch (scope) {
            case 'flow':
                return deepGet(flowState, path);
            case 'session':
                return deepGet(sessionState, path);
            case 'local':
                return deepGet(localState, path);
        }
    }
    function write(scope, path, value) {
        switch (scope) {
            case 'flow':
                flowState = deepSet(flowState, path, value);
                break;
            case 'session':
                sessionState = deepSet(sessionState, path, value);
                persistSession();
                break;
            case 'local':
                localState = deepSet(localState, path, value);
                break;
        }
        bus.emit('change', { scope, path, value });
    }
    function snapshot() {
        return {
            flow: flowState,
            session: sessionState,
            local: localState,
            params: paramsState,
        };
    }
    return {
        snapshot,
        get({ scope, path }) {
            return read(scope, path);
        },
        read,
        set(target, value) {
            write(target.scope, target.path, value);
        },
        write,
        replace(scope, next) {
            const cloned = { ...next };
            switch (scope) {
                case 'flow':
                    flowState = cloned;
                    break;
                case 'session':
                    sessionState = cloned;
                    persistSession();
                    break;
                case 'local':
                    localState = cloned;
                    break;
            }
            bus.emit('change', { scope, path: '', value: cloned });
        },
        on(event, listener) {
            return bus.on(event, listener);
        },
        persistSession,
        get params() {
            return paramsState;
        },
        setParams(next) {
            paramsState = { ...next };
        },
    };
}
//# sourceMappingURL=state.js.map