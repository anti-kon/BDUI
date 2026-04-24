import type { Action } from '@bdui/core';
import type { ComponentDefinition, ComponentNode } from '../../registry/types.js';
export interface ButtonProps {
    title: string;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'primary' | 'secondary';
    onAction?: readonly Action[];
}
export type ButtonNode = ComponentNode<ButtonProps> & ButtonProps;
export declare const manifest: import("../../define.js").ComponentManifest;
export declare const definition: ComponentDefinition<ButtonNode>;
export default definition;
//# sourceMappingURL=index.d.ts.map