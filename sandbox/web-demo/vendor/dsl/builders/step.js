import { createNode, normalizeList, optionalList } from './shared.js';
export function Step({ id, title, children, onEnter, onExit, onResume, transitions }) {
  const childNodes = normalizeList(children);
  const step = {
    id,
    title,
    children: childNodes,
    onEnter: optionalList(onEnter),
    onExit: optionalList(onExit),
    onResume: optionalList(onResume),
    transitions: optionalList(transitions),
  };
  return createNode('Step', step);
}
