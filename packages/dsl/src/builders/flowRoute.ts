import type { AnyDslNode, DslNode, FlowRouteScreen, FlowStep } from './shared.js';
import { createNode, normalizeList } from './shared.js';

type FlowRouteProps = {
  id: string;
  title?: string;
  startStep: string;
  persistence?: Record<string, unknown>;
  children?: AnyDslNode | AnyDslNode[] | null | undefined | false;
};

export function FlowRoute({ id, title, startStep, persistence, children }: FlowRouteProps) {
  const nodes = normalizeList<AnyDslNode>(children);
  const steps = nodes
    .filter((node): node is DslNode<'Step', FlowStep> => node?.__kind === 'Step')
    .map((node) => node.value);

  const flowRoute: FlowRouteScreen = {
    id,
    type: 'flow',
    title,
    startStep,
    persistence,
    steps,
  };

  return createNode('FlowRoute', flowRoute);
}
