import type { ComponentDefinition, ComponentNode } from '../types.js';
export type ButtonProps = {
  id?: string;
  modifiers?: Record<string, unknown>;
  title: string;
  disabled?: boolean;
  loading?: boolean;
  onAction?: any[];
};
export type ButtonNode = ComponentNode<ButtonProps>;
export declare const manifest: import('../../define.js').ComponentManifest;
export declare const definition: ComponentDefinition<ButtonNode>;
export default definition;
