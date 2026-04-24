import type { FlowPersistence, FlowRouteScreen } from '@bdui/core';
import type { AnyDslNode, DslNode } from './shared.js';
export interface FlowRouteProps {
    id: string;
    title?: string;
    startStep: string;
    persistence?: FlowPersistence;
    children?: AnyDslNode | readonly AnyDslNode[] | null | undefined | false;
}
export declare function FlowRoute({ id, title, startStep, persistence, children }: FlowRouteProps): DslNode<"FlowRoute", FlowRouteScreen>;
//# sourceMappingURL=flowRoute.d.ts.map