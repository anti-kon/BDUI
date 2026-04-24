import type { ComponentDefinition, ComponentNode } from '../../registry/types.js';
export interface RowProps {
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
    gap?: number | string;
    wrap?: boolean;
}
export type RowNode = ComponentNode<RowProps> & RowProps;
export declare const manifest: import("../../define.js").ComponentManifest;
export declare const definition: ComponentDefinition<RowNode>;
export default definition;
//# sourceMappingURL=index.d.ts.map