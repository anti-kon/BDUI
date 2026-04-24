import type { Action, Binding } from '@bdui/core';
import type { ComponentDefinition, ComponentNode } from '../../registry/types.js';
export interface SelectOption {
    readonly value: string | number;
    readonly label: string;
    readonly disabled?: boolean;
}
export interface SelectProps {
    binding: Binding;
    options: readonly SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    onChangeAction?: readonly Action[];
}
export type SelectNode = ComponentNode<SelectProps> & SelectProps;
export declare const manifest: import("../../define.js").ComponentManifest;
export declare const definition: ComponentDefinition<SelectNode>;
export default definition;
//# sourceMappingURL=index.d.ts.map