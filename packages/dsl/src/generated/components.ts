// AUTO-GENERATED. Do not edit.
import type { BDUIElement } from '@bdui/core';
import type {
  ButtonProps,
  CheckboxProps,
  ColumnProps,
  DividerProps,
  IfProps,
  ImageProps,
  InputProps,
  RowProps,
  SelectProps,
  TextProps,
} from '@bdui/defs';

import type { NoChildrenProps, NodeChildrenProps, TextChildrenProps } from '../component-props.js';
import { createNode } from '../glue/runtime.js';

export type ButtonDslProps = NoChildrenProps<ButtonProps, 'onAction'>;
export function Button(props: ButtonDslProps): BDUIElement {
  return createNode('Button', props as unknown as Record<string, unknown>, {
    children: 'none',
    events: ['onAction'],
  });
}
export type CheckboxDslProps = NoChildrenProps<CheckboxProps, 'onChangeAction'>;
export function Checkbox(props: CheckboxDslProps): BDUIElement {
  return createNode('Checkbox', props as unknown as Record<string, unknown>, {
    children: 'none',
    events: ['onChangeAction'],
  });
}
export type ColumnDslProps = NodeChildrenProps<ColumnProps, never>;
export function Column(props: ColumnDslProps): BDUIElement {
  return createNode('Column', props as unknown as Record<string, unknown>, { children: 'nodes' });
}
export type DividerDslProps = NoChildrenProps<DividerProps, never>;
export function Divider(props: DividerDslProps): BDUIElement {
  return createNode('Divider', props as unknown as Record<string, unknown>, { children: 'none' });
}
export type IfDslProps = NodeChildrenProps<IfProps, never>;
export function If(props: IfDslProps): BDUIElement {
  return createNode('If', props as unknown as Record<string, unknown>, { children: 'nodes' });
}
export type ImageDslProps = NoChildrenProps<ImageProps, never>;
export function Image(props: ImageDslProps): BDUIElement {
  return createNode('Image', props as unknown as Record<string, unknown>, { children: 'none' });
}
export type InputDslProps = NoChildrenProps<InputProps, 'onChangeAction' | 'onBlurAction'>;
export function Input(props: InputDslProps): BDUIElement {
  return createNode('Input', props as unknown as Record<string, unknown>, {
    children: 'none',
    events: ['onChangeAction', 'onBlurAction'],
  });
}
export type RowDslProps = NodeChildrenProps<RowProps, never>;
export function Row(props: RowDslProps): BDUIElement {
  return createNode('Row', props as unknown as Record<string, unknown>, { children: 'nodes' });
}
export type SelectDslProps = NoChildrenProps<SelectProps, 'onChangeAction'>;
export function Select(props: SelectDslProps): BDUIElement {
  return createNode('Select', props as unknown as Record<string, unknown>, {
    children: 'none',
    events: ['onChangeAction'],
  });
}
export type TextDslProps = TextChildrenProps<TextProps, never>;
export function Text(props: TextDslProps): BDUIElement {
  return createNode('Text', props as unknown as Record<string, unknown>, {
    children: 'text',
    mapToProp: 'text',
    aliases: { value: 'text' },
  });
}
