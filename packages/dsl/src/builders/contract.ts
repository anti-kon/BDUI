import { __collectInitial } from '../state.js';
import type {
  AnyDslNode,
  Contract as ContractType,
  Meta,
  NavigationType,
  Theme,
} from './shared.js';
import { type Maybe, normalizeList, pickNode } from './shared.js';

type ContractProps = { meta: Meta; children?: Maybe<AnyDslNode | AnyDslNode[]> };

export function Contract({ meta, children }: ContractProps): ContractType {
  const now = new Date().toISOString();
  const normMeta = { ...meta, generatedAt: meta.generatedAt ?? now };
  const nodes = normalizeList<AnyDslNode>(children);

  const themeNode = pickNode<'Theme', Theme>(nodes, 'Theme');
  const navNode = pickNode<'Navigation', NavigationType>(nodes, 'Navigation');
  if (!navNode) throw new Error('Contract: Navigation child is required');

  return {
    meta: normMeta,
    theme: themeNode?.value,
    navigation: navNode.value,
    initial: __collectInitial(),
  } satisfies ContractType;
}
