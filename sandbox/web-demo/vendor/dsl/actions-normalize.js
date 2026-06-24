import { ensureExprRef, parseTarget } from './target.js';
export { parseTarget } from './target.js';
function isFullAction(a) {
    return Boolean(a) && typeof a === 'object' && typeof a.type === 'string';
}
export function normalizeOne(literal) {
    if (isFullAction(literal))
        return literal;
    if (!literal || typeof literal !== 'object') {
        throw new Error(`Unknown action literal: ${JSON.stringify(literal)}`);
    }
    const l = literal;
    if ('set' in l) {
        const [target, value] = l.set;
        return { type: 'set', params: { target: parseTarget(target), value } };
    }
    if ('reset' in l) {
        const [target, value] = l.reset;
        return { type: 'reset', params: { target: parseTarget(target), value } };
    }
    if ('inc' in l) {
        const raw = l.inc;
        const target = Array.isArray(raw) ? raw[0] : raw;
        const by = Array.isArray(raw) ? raw[1] : undefined;
        return { type: 'update.inc', params: { target: parseTarget(target), by } };
    }
    if ('dec' in l) {
        const raw = l.dec;
        const target = Array.isArray(raw) ? raw[0] : raw;
        const by = Array.isArray(raw) ? raw[1] : undefined;
        return { type: 'update.dec', params: { target: parseTarget(target), by } };
    }
    if ('toggle' in l) {
        return { type: 'update.toggle', params: { target: parseTarget(l.toggle) } };
    }
    if ('append' in l) {
        const [target, value] = l.append;
        return { type: 'update.append', params: { target: parseTarget(target), value } };
    }
    if ('merge' in l) {
        const [target, value] = l.merge;
        return { type: 'update.merge', params: { target: parseTarget(target), value } };
    }
    if ('navigate' in l) {
        const [to, opts] = l.navigate;
        return { type: 'navigate', params: { to, ...(opts ?? {}) } };
    }
    if ('back' in l)
        return { type: 'back' };
    if ('replace' in l)
        return { type: 'replace', params: { to: l.replace } };
    if ('popToRoot' in l)
        return { type: 'popToRoot' };
    if ('fetch' in l) {
        const v = l.fetch;
        if (typeof v === 'string')
            return { type: 'fetch', params: { sourceId: v } };
        const fetch = v;
        return {
            type: 'fetch',
            params: {
                sourceId: fetch.sourceId,
                params: fetch.params,
                saveTo: fetch.saveTo ? parseTarget(fetch.saveTo) : undefined,
            },
        };
    }
    if ('call' in l) {
        const call = l.call;
        const base = {
            type: 'call',
            params: {
                url: call.url,
                method: call.method,
                headers: call.headers,
                body: call.body,
                saveTo: call.saveTo ? parseTarget(call.saveTo) : undefined,
                timeoutMs: call.timeoutMs,
            },
            ...(call.rollback ? { rollbackAction: normalizeOne(call.rollback) } : {}),
        };
        return base;
    }
    if ('toast' in l) {
        const [message, opts] = l.toast;
        return { type: 'toast', params: { message, ...(opts ?? {}) } };
    }
    if ('sync' in l) {
        return { type: 'sync', params: l.sync ?? {} };
    }
    if ('validate' in l) {
        const [schemaRef, target] = l.validate;
        return { type: 'validate', params: { schemaRef, target: parseTarget(target) } };
    }
    if ('modalOpen' in l)
        return { type: 'modal.open', params: { id: l.modalOpen } };
    if ('modalClose' in l)
        return { type: 'modal.close', params: { id: l.modalClose } };
    if ('prefetch' in l) {
        return { type: 'prefetchScreens', params: { screens: l.prefetch } };
    }
    if ('batch' in l) {
        const list = l.batch;
        const atomic = l.atomic;
        return {
            type: 'batch',
            params: { actions: list.map(normalizeOne), ...(atomic !== undefined ? { atomic } : {}) },
        };
    }
    if ('when' in l) {
        const cfg = l.when;
        return {
            type: 'when',
            params: {
                if: ensureExprRef(cfg.if),
                then: cfg.then.map(normalizeOne),
                ...(cfg.else ? { else: cfg.else.map(normalizeOne) } : {}),
            },
        };
    }
    if ('flowStart' in l) {
        const p = l.flowStart;
        return { type: 'flow.start', params: p };
    }
    if ('flowAdvance' in l) {
        const p = l.flowAdvance;
        return { type: 'flow.advance', params: p === true ? {} : p };
    }
    if ('flowGoTo' in l) {
        const p = l.flowGoTo;
        return { type: 'flow.goTo', params: p };
    }
    if ('flowResume' in l) {
        const p = l.flowResume;
        return { type: 'flow.resume', params: p === true ? {} : p };
    }
    if ('flowAbort' in l) {
        const p = l.flowAbort;
        return {
            type: 'flow.abort',
            params: p === true ? {} : p,
        };
    }
    if ('flowComplete' in l) {
        const p = l.flowComplete;
        return { type: 'flow.complete', params: p === true ? {} : p };
    }
    throw new Error(`Unknown action literal: ${JSON.stringify(literal)}`);
}
function asArray(value) {
    if (value == null)
        return [];
    return Array.isArray(value) ? value : [value];
}
export function normalizeActions(input) {
    if (input == null)
        return [];
    return asArray(input).map(normalizeOne);
}
//# sourceMappingURL=actions-normalize.js.map