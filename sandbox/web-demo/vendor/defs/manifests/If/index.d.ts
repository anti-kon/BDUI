import type { ComponentDefinition, ComponentNode } from '../../registry/types.js';
export interface IfProps {
    condition: unknown;
}
export type IfNode = ComponentNode<IfProps> & IfProps;
export declare const manifest: import("../../define.js").ComponentManifest;
export declare const definition: ComponentDefinition<IfNode>;
export default definition;
//# sourceMappingURL=index.d.ts.map