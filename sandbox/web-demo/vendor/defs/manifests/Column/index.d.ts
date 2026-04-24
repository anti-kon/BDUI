import type { ComponentDefinition, ComponentNode } from '../../registry/types.js';
export interface ColumnProps {
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
    gap?: number | string;
}
export type ColumnNode = ComponentNode<ColumnProps> & ColumnProps;
export declare const manifest: import("../../define.js").ComponentManifest;
export declare const definition: ComponentDefinition<ColumnNode>;
export default definition;
//# sourceMappingURL=index.d.ts.map