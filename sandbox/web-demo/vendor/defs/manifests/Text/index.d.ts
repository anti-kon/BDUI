import type { ComponentDefinition, ComponentNode } from '../../registry/types.js';
export type TextProps = {
  id?: string;
  modifiers?: Record<string, unknown>;
  text?: unknown;
  value?: unknown;
};
export type TextNode = ComponentNode<TextProps>;
export declare const manifest: import('../../define.js').ComponentManifest;
export declare const definition: ComponentDefinition<TextNode>;
export default definition;
