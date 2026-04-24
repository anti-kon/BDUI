import type { Action, Binding } from '@bdui/core';
import type { ComponentDefinition, ComponentNode } from '../../registry/types.js';
export interface CheckboxProps {
    binding: Binding;
    label?: string;
    disabled?: boolean;
    onChangeAction?: readonly Action[];
}
export type CheckboxNode = ComponentNode<CheckboxProps> & CheckboxProps;
export declare const manifest: import("../../define.js").ComponentManifest;
export declare const definition: ComponentDefinition<CheckboxNode>;
export default definition;
//# sourceMappingURL=index.d.ts.map