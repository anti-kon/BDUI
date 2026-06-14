import type { Contract, DataSource, Meta } from '@bdui/core';
import type { AnyDslNode } from './shared.js';
import { type Maybe } from './shared.js';
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
export declare function Contract({ meta, dataSources, children }: ContractProps): Contract;
//# sourceMappingURL=contract.d.ts.map