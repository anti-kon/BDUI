import type { AnyDslNode, Contract as ContractType, Meta } from './shared.js';
import { type Maybe } from './shared.js';
type ContractProps = {
  meta: Meta;
  children?: Maybe<AnyDslNode | AnyDslNode[]>;
};
export declare function Contract({ meta, children }: ContractProps): ContractType;
export {};
