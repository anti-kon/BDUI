const FLOW_ACTION_TYPES = new Set([
    'flow.start',
    'flow.advance',
    'flow.goTo',
    'flow.resume',
    'flow.abort',
    'flow.complete',
]);
export function isFlowAction(action) {
    return FLOW_ACTION_TYPES.has(action.type);
}
export function isUpdateAction(action) {
    return action.type === 'set' || action.type === 'reset' || action.type.startsWith('update.');
}
//# sourceMappingURL=action.js.map