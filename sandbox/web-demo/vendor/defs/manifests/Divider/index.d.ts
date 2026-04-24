import type { ComponentDefinition, ComponentNode } from '../../registry/types.js';
export interface DividerProps {
    orientation?: 'horizontal' | 'vertical';
    thickness?: number;
    color?: string;
}
export type DividerNode = ComponentNode<DividerProps> & DividerProps;
export declare const manifest: import("../../define.js").ComponentManifest;
export declare const definition: ComponentDefinition<DividerNode>;
export default definition;
//# sourceMappingURL=index.d.ts.map