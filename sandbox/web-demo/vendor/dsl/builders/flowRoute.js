import { createNode, normalizeList } from './shared.js';
export function FlowRoute({ id, title, startStep, persistence, children }) {
  const nodes = normalizeList(children);
  const steps = nodes.filter((node) => node?.__kind === 'Step').map((node) => node.value);
  const flowRoute = {
    id,
    type: 'flow',
    title,
    startStep,
    persistence,
    steps,
  };
  return createNode('FlowRoute', flowRoute);
}
