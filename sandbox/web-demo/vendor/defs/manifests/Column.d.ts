import type { ComponentDefinition, ComponentNode } from '../registry/types.js';
export type ColumnProps = {
  id?: string;
  modifiers?: Record<string, unknown>;
};
export type ColumnNode = ComponentNode<ColumnProps>;
export declare const manifest: import('../define.js').ComponentManifest;
export declare const definition: ComponentDefinition<ColumnNode>;
export default definition;
