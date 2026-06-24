export function isUpdateAction(action) {
    return action.type === 'set' || action.type === 'reset' || action.type.startsWith('update.');
}
//# sourceMappingURL=state.js.map