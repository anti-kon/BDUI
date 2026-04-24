import type { ComponentDefinition, ComponentNode } from '../../registry/types.js';
export interface ImageProps {
    src: string;
    alt?: string;
    width?: number | string;
    height?: number | string;
    loading?: 'eager' | 'lazy';
    fit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}
export type ImageNode = ComponentNode<ImageProps> & ImageProps;
export declare const manifest: import("../../define.js").ComponentManifest;
export declare const definition: ComponentDefinition<ImageNode>;
export default definition;
//# sourceMappingURL=index.d.ts.map