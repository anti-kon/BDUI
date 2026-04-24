import { isExprRef } from '@bdui/core';
import { evalExprRef, interpolate, resolveValue as resolveExpressionValue } from '@bdui/expr';
import { EventBus } from './events.js';
import { evaluate, evaluateGuard } from './expression.js';
function toNumber(value) {
    if (typeof value === 'number')
        return value;
    if (typeof value === 'string') {
        const n = Number(value);
        return Number.isFinite(n) ? n : 0;
    }
    return 0;
}
function resolveValue(value, state, params) {
    const snapshot = state.snapshot();
    if (value === null || value === undefined)
        return value;
    if (isExprRef(value))
        return evalExprRef(value, snapshot, params);
    if (typeof value === 'string') {
        const raw = resolveExpressionValue(value, snapshot, params);
        if (typeof raw === 'string' && raw === value && /\{\{.+\}\}/.test(value)) {
            return interpolate(value, snapshot, params);
        }
        return raw;
    }
    if (Array.isArray(value))
        return value.map((v) => resolveValue(v, state, params));
    if (typeof value === 'object') {
        const record = value;
        const out = {};
        for (const [k, v] of Object.entries(record))
            out[k] = resolveValue(v, state, params);
        return out;
    }
    return value;
}
export function createActionRunner(deps) {
    const bus = new EventBus();
    const { contract, state, navigation, flow, toast, modal, http, validators, prefetchScreens } = deps;
    async function handleNavigate(action) {
        const mode = action.params.mode ?? 'push';
        if (mode === 'popToRoot') {
            navigation.popToRoot();
            navigation.navigate(action.params.to, 'replace');
        }
        else {
            navigation.navigate(action.params.to, mode);
        }
        bus.emit('routeDirty', {});
    }
    function handleReplace(action) {
        navigation.replace(action.params.to);
        bus.emit('routeDirty', {});
    }
    function handleSet(action) {
        const resolved = resolveValue(action.params.value, state);
        state.set(action.params.target, resolved);
        bus.emit('stateDirty', {});
    }
    function handleReset(action) {
        state.set(action.params.target, action.params.value ?? undefined);
        bus.emit('stateDirty', {});
    }
    function handleInc(action) {
        const current = state.get(action.params.target);
        const byRaw = action.params.by;
        const by = byRaw === undefined ? 1 : toNumber(evaluate(byRaw, state.snapshot()));
        state.set(action.params.target, toNumber(current) + by);
        bus.emit('stateDirty', {});
    }
    function handleDec(action) {
        const current = state.get(action.params.target);
        const byRaw = action.params.by;
        const by = byRaw === undefined ? 1 : toNumber(evaluate(byRaw, state.snapshot()));
        state.set(action.params.target, toNumber(current) - by);
        bus.emit('stateDirty', {});
    }
    function handleToggle(action) {
        const current = state.get(action.params.target);
        state.set(action.params.target, !current);
        bus.emit('stateDirty', {});
    }
    function handleAppend(action) {
        const current = state.get(action.params.target);
        const list = Array.isArray(current) ? [...current] : [];
        list.push(resolveValue(action.params.value, state));
        state.set(action.params.target, list);
        bus.emit('stateDirty', {});
    }
    function handleMerge(action) {
        const current = state.get(action.params.target);
        const patch = resolveValue(action.params.value, state);
        const base = current !== null && typeof current === 'object' && !Array.isArray(current)
            ? current
            : {};
        state.set(action.params.target, { ...base, ...patch });
        bus.emit('stateDirty', {});
    }
    function handleMapPath(action) {
        const current = state.get(action.params.target);
        if (!current || typeof current !== 'object' || Array.isArray(current))
            return;
        const src = current;
        let out = { ...(action.params.defaults ?? {}), ...src };
        if (action.params.pick) {
            const picked = {};
            for (const key of action.params.pick) {
                if (key in out)
                    picked[key] = out[key];
            }
            out = picked;
        }
        if (action.params.rename) {
            const renamed = {};
            for (const [from, to] of Object.entries(action.params.rename)) {
                if (from in out)
                    renamed[to] = out[from];
            }
            out = { ...out, ...renamed };
            for (const key of Object.keys(action.params.rename)) {
                delete out[key];
            }
        }
        state.set(action.params.target, out);
        bus.emit('stateDirty', {});
    }
    function handleToast(action) {
        const message = String(evaluate(action.params.message, state.snapshot()) ?? '');
        toast.show({ message, level: action.params.level, durationMs: action.params.durationMs });
    }
    function handleModalOpen(action) {
        modal.open(action.params.id);
    }
    function handleModalClose(action) {
        modal.close(action.params.id);
    }
    async function handlePrefetch(action) {
        if (prefetchScreens)
            await prefetchScreens(action.params.screens);
    }
    async function handleCall(action) {
        if (!http) {
            bus.emit('error', { action, error: new Error('no HTTP client configured') });
            return;
        }
        const url = String(resolveValue(action.params.url, state) ?? '');
        const body = resolveValue(action.params.body, state);
        try {
            const response = await http({
                url,
                method: action.params.method,
                headers: action.params.headers,
                body,
                timeoutMs: action.params.timeoutMs,
            });
            if (response.status >= 400) {
                if (action.rollbackAction)
                    await run(action.rollbackAction);
                bus.emit('error', {
                    action,
                    error: Object.assign(new Error(`HTTP ${response.status}`), { response }),
                });
                return;
            }
            if (action.params.saveTo) {
                state.set(action.params.saveTo, response.body);
                bus.emit('stateDirty', {});
            }
        }
        catch (error) {
            if (action.rollbackAction)
                await run(action.rollbackAction);
            bus.emit('error', { action, error });
        }
    }
    function dataSourceById(sourceId) {
        return contract?.dataSources?.find((source) => source.id === sourceId);
    }
    async function executeHttpDataSource(source, params) {
        if (!http)
            throw new Error('no HTTP client configured');
        if (!source.url)
            throw new Error(`Data source "${source.id}" has no url`);
        const url = String(resolveValue(source.url, state, params) ?? '');
        const method = source.method ?? (source.kind === 'graphql' ? 'POST' : 'GET');
        const headers = resolveValue(source.headers, state, params);
        const body = source.body === undefined && source.kind === 'graphql'
            ? params
            : resolveValue(source.body, state, params);
        const response = await http({
            url,
            method,
            headers,
            body,
        });
        if (response.status >= 400) {
            throw Object.assign(new Error(`HTTP ${response.status}`), { response });
        }
        return response.body;
    }
    async function handleFetch(action) {
        const source = dataSourceById(action.params.sourceId);
        if (!source) {
            bus.emit('error', {
                action,
                error: new Error(`Data source not found: ${action.params.sourceId}`),
            });
            return;
        }
        const params = (resolveValue(action.params.params ?? {}, state) ?? {});
        try {
            const result = source.kind === 'static'
                ? resolveValue(source.value, state, params)
                : await executeHttpDataSource(source, params);
            state.set(action.params.saveTo ?? { scope: 'local', path: `dataSources.${source.id}` }, result);
            bus.emit('stateDirty', {});
        }
        catch (error) {
            bus.emit('error', { action, error });
        }
    }
    function handleSync(_action) {
        state.persistSession();
    }
    function normalizeValidationResult(result) {
        if (typeof result === 'boolean')
            return { ok: result, errors: result ? [] : ['invalid'] };
        if (typeof result === 'string')
            return { ok: false, errors: [result] };
        if (Array.isArray(result)) {
            const errors = result;
            return { ok: errors.length === 0, errors };
        }
        const objectResult = result;
        return {
            ok: objectResult.ok,
            errors: objectResult.errors ?? (objectResult.ok ? [] : ['invalid']),
        };
    }
    async function handleValidate(action) {
        const validator = validators?.[action.params.schemaRef];
        if (!validator) {
            bus.emit('error', {
                action,
                error: new Error(`Validator not found: ${action.params.schemaRef}`),
            });
            return;
        }
        try {
            const value = state.get(action.params.target);
            const result = normalizeValidationResult(await validator(value, {
                schemaRef: action.params.schemaRef,
                target: action.params.target,
                state: state.snapshot(),
            }));
            const current = state.read('local', '__validation') ?? {};
            state.write('local', '__validation', {
                ...current,
                [action.params.schemaRef]: {
                    ok: result.ok,
                    errors: result.errors,
                    target: action.params.target,
                },
            });
            bus.emit('stateDirty', {});
            if (!result.ok) {
                bus.emit('error', {
                    action,
                    error: Object.assign(new Error(`Validation failed: ${action.params.schemaRef}`), {
                        errors: result.errors,
                    }),
                });
            }
        }
        catch (error) {
            bus.emit('error', { action, error });
        }
    }
    async function handleBatch(action) {
        const atomic = action.params.atomic !== false;
        if (!atomic) {
            for (const sub of action.params.actions)
                await run(sub);
            return;
        }
        const snapshotFlow = { ...state.snapshot().flow };
        const snapshotSession = { ...state.snapshot().session };
        const snapshotLocal = { ...state.snapshot().local };
        try {
            for (const sub of action.params.actions)
                await run(sub);
        }
        catch (error) {
            state.replace('flow', snapshotFlow);
            state.replace('session', snapshotSession);
            state.replace('local', snapshotLocal);
            throw error;
        }
    }
    async function handleWhen(action) {
        const pass = evaluateGuard(action.params.if, state.snapshot());
        const branch = pass ? action.params.then : action.params.else;
        if (!branch)
            return;
        for (const sub of branch)
            await run(sub);
    }
    function handleFlowStart(action) {
        flow.activate(action.params.routeId);
        if (action.params.params)
            state.setParams(action.params.params);
        navigation.navigate(action.params.routeId, 'push');
        bus.emit('routeDirty', {});
    }
    function handleFlowAdvance(action) {
        /* Handled by the renderer in concert with flow resolution. Emitting dirty
         * signals is enough — the platform will re-render and evaluate next step. */
        void action;
        bus.emit('routeDirty', {});
    }
    function handleFlowGoTo(action) {
        const routeId = action.params.routeId ?? navigation.currentRoute;
        state.write('local', `__flow.${routeId}.current`, action.params.stepId);
        bus.emit('stateDirty', {});
    }
    function handleFlowResume(action) {
        void action;
        bus.emit('routeDirty', {});
    }
    function handleFlowAbort(action) {
        const routeId = action.params?.routeId ?? navigation.currentRoute;
        flow.deactivate(routeId);
        bus.emit('routeDirty', {});
    }
    function handleFlowComplete(action) {
        const routeId = action.params?.routeId ?? navigation.currentRoute;
        flow.deactivate(routeId);
        bus.emit('routeDirty', {});
    }
    async function run(action) {
        try {
            switch (action.type) {
                case 'navigate':
                    await handleNavigate(action);
                    break;
                case 'replace':
                    handleReplace(action);
                    break;
                case 'back':
                    navigation.back();
                    bus.emit('routeDirty', {});
                    break;
                case 'popToRoot':
                    navigation.popToRoot();
                    bus.emit('routeDirty', {});
                    break;
                case 'set':
                    handleSet(action);
                    break;
                case 'reset':
                    handleReset(action);
                    break;
                case 'update.inc':
                    handleInc(action);
                    break;
                case 'update.dec':
                    handleDec(action);
                    break;
                case 'update.toggle':
                    handleToggle(action);
                    break;
                case 'update.append':
                    handleAppend(action);
                    break;
                case 'update.merge':
                    handleMerge(action);
                    break;
                case 'update.mapPath':
                    handleMapPath(action);
                    break;
                case 'sync':
                    handleSync(action);
                    break;
                case 'validate':
                    await handleValidate(action);
                    break;
                case 'fetch':
                    await handleFetch(action);
                    break;
                case 'call':
                    await handleCall(action);
                    break;
                case 'toast':
                    handleToast(action);
                    break;
                case 'modal.open':
                    handleModalOpen(action);
                    break;
                case 'modal.close':
                    handleModalClose(action);
                    break;
                case 'prefetchScreens':
                    await handlePrefetch(action);
                    break;
                case 'batch':
                    await handleBatch(action);
                    break;
                case 'when':
                    await handleWhen(action);
                    break;
                case 'flow.start':
                    handleFlowStart(action);
                    break;
                case 'flow.advance':
                    handleFlowAdvance(action);
                    break;
                case 'flow.goTo':
                    handleFlowGoTo(action);
                    break;
                case 'flow.resume':
                    handleFlowResume(action);
                    break;
                case 'flow.abort':
                    handleFlowAbort(action);
                    break;
                case 'flow.complete':
                    handleFlowComplete(action);
                    break;
                default: {
                    const exhaustive = action;
                    throw new Error(`Unknown action type: ${exhaustive.type}`);
                }
            }
            bus.emit('executed', { action });
        }
        catch (error) {
            bus.emit('error', { action, error });
        }
    }
    return {
        run,
        async runAll(actions) {
            if (!actions || actions.length === 0)
                return;
            for (const action of actions)
                await run(action);
        },
        on(event, listener) {
            return bus.on(event, listener);
        },
    };
}
//# sourceMappingURL=actions.js.map