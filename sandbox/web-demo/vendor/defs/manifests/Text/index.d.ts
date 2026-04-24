import type { ComponentDefinition, ComponentNode } from '../../registry/types.js';
export interface TextProps {
    text?: unknown;
    value?: unknown;
}
export type TextNode = ComponentNode<TextProps> & TextProps;
export declare const manifest: import("../../define.js").ComponentManifest;
export declare const definition: ComponentDefinition<TextNode>;
export default definition;
//# sourceMappingURL=index.d.ts.map