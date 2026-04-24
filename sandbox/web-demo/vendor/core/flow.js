export function isFlowStateHandle(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    const v = value;
    return (typeof v.routeId === 'string' &&
        typeof v.currentStepId === 'string' &&
        typeof v.startedAt === 'string' &&
        Array.isArray(v.history));
}
//# sourceMappingURL=flow.js.map