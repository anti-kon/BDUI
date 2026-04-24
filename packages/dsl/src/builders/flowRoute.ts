import type { FlowPersistence, FlowRouteScreen, FlowStep } from '@bdui/core';

import type { AnyDslNode, DslNode } from './shared.js';
import { createNode, normalizeList } from './shared.js';

export interface FlowRouteProps {
  id: string;
  title?: string;
  startStep: string;
  persistence?: FlowPersistence;
  children?: AnyDslNode | readonly AnyDslNode[] | null | undefined | false;
}

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
