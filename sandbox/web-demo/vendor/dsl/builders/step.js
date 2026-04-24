import { normalizeActions } from '../actions-normalize.js';
import { createNode, normalizeList, optionalList } from './shared.js';
function normActionsMaybe(input) {
    const list = optionalList(input);
    if (!list)
        return undefined;
    return normalizeActions(list);
}
export function Step({ id, title, children, onEnter, onExit, onResume, transitions }) {
    const childNodes = normalizeList(children);
    const step = {
        id,
        title,
        children: childNodes,
        onEnter: normActionsMaybe(onEnter),
        onExit: normActionsMaybe(onExit),
        onResume: normActionsMaybe(onResume),
        transitions: optionalList(transitions),
    };
    return createNode('Step', step);
}
//# sourceMappingURL=step.js.map