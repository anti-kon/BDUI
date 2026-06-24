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
//# sourceMappingURL=flow.js.map