import type { ComponentDefinition, ComponentNode } from '../../registry/types.js';
export type RowProps = {
  id?: string;
  modifiers?: Record<string, unknown>;
};
export type RowNode = ComponentNode<RowProps>;
export declare const manifest: import('../../define.js').ComponentManifest;
export declare const definition: ComponentDefinition<RowNode>;
export default definition;
