import type { Contract, DataSource, Meta, Navigation as NavigationType, Theme } from '@bdui/core';
import { SCHEMA_VERSION } from '@bdui/core';

import { createStateCollector, withStateCollector } from '../state.js';
import type { AnyDslNode } from './shared.js';
import { type Maybe, normalizeList, pickNode } from './shared.js';

const DEFAULT_GENERATED_AT = '1970-01-01T00:00:00.000Z';

export interface ContractProps {
  meta: Omit<Meta, 'schemaVersion' | 'generatedAt'> & {
    schemaVersion?: string;
    generatedAt?: string;
  };
  dataSources?: readonly DataSource[];
  children?: Maybe<AnyDslNode | readonly AnyDslNode[]>;
}

/**
 * Top-level DSL entry. Collects an `InitialState` declared by `Flow()`/`Session()`
 * variables used inside the TSX tree; the result is a fully-normalised JSON
 * contract ready to be validated.
 */
export function Contract({ meta, dataSources, children }: ContractProps): Contract {
  const collector = createStateCollector();

  const result = withStateCollector(collector, () => {
    const nodes = normalizeList<AnyDslNode>(children);
    const themeNode = pickNode<'Theme', Theme>(nodes, 'Theme');
    const navNode = pickNode<'Navigation', NavigationType>(nodes, 'Navigation');
    if (!navNode) throw new Error('Contract: Navigation child is required');
    return { themeNode, navNode };
  });

  const generatedAt = meta.generatedAt ?? DEFAULT_GENERATED_AT;
  const normMeta: Meta = {
    contractId: meta.contractId,
    version: meta.version,
    schemaVersion: meta.schemaVersion ?? SCHEMA_VERSION,
    generatedAt,
    appId: meta.appId,
    compatFrom: meta.compatFrom,
    signature: meta.signature,
    features: meta.features,
  };

  return {
    meta: normMeta,
    theme: result.themeNode?.value,
    dataSources: metaDataSources(dataSources),
    navigation: result.navNode.value,
    initial: collector.snapshot(),
  };
}

function metaDataSources(
  dataSources: readonly DataSource[] | undefined,
): readonly DataSource[] | undefined {
  return dataSources && dataSources.length > 0 ? dataSources : undefined;
}
