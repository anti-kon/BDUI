import type { Action, Binding } from '@bdui/core';
import type { ComponentDefinition, ComponentNode } from '../../registry/types.js';
export type InputType = 'text' | 'number' | 'email' | 'password' | 'tel' | 'url';
export interface InputProps {
    binding: Binding;
    placeholder?: string;
    inputType?: InputType;
    disabled?: boolean;
    readOnly?: boolean;
    autoComplete?: string;
    maxLength?: number;
    onChangeAction?: readonly Action[];
    onBlurAction?: readonly Action[];
}
export type InputNode = ComponentNode<InputProps> & InputProps;
export declare const manifest: import("../../define.js").ComponentManifest;
export declare const definition: ComponentDefinition<InputNode>;
export default definition;
//# sourceMappingURL=index.d.ts.map