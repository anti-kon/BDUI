import { SCHEMA_VERSION } from '@bdui/core';
import { createStateCollector, withStateCollector } from '../state.js';
import { normalizeList, pickNode } from './shared.js';
const DEFAULT_GENERATED_AT = '1970-01-01T00:00:00.000Z';
/**
 * Top-level DSL entry. Collects an `InitialState` declared by `Flow()`/`Session()`
 * variables used inside the TSX tree; the result is a fully-normalised JSON
 * contract ready to be validated.
 */
export function Contract({ meta, children }) {
    const collector = createStateCollector();
    const result = withStateCollector(collector, () => {
        const nodes = normalizeList(children);
        const themeNode = pickNode(nodes, 'Theme');
        const navNode = pickNode(nodes, 'Navigation');
        if (!navNode)
            throw new Error('Contract: Navigation child is required');
        return { themeNode, navNode };
    });
    const generatedAt = meta.generatedAt ?? DEFAULT_GENERATED_AT;
    const normMeta = {
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
        navigation: result.navNode.value,
        initial: collector.snapshot(),
    };
}
//# sourceMappingURL=contract.js.map