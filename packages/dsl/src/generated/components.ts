// AUTO-GENERATED. Do not edit.
import { createNode } from '../glue/runtime.js';

export function Button(props: any): any {
  return createNode('Button', props, {
    children: 'none',
    events: ['onAction'],
  });
}
export function Checkbox(props: any): any {
  return createNode('Checkbox', props, {
    children: 'none',
    events: ['onChangeAction'],
  });
}
export function Column(props: any): any {
  return createNode('Column', props, { children: 'nodes' });
}
export function Divider(props: any): any {
  return createNode('Divider', props, { children: 'none' });
}
export function If(props: any): any {
  return createNode('If', props, { children: 'nodes' });
}
export function Image(props: any): any {
  return createNode('Image', props, { children: 'none' });
}
export function Input(props: any): any {
  return createNode('Input', props, {
    children: 'none',
    events: ['onChangeAction', 'onBlurAction'],
  });
}
export function Row(props: any): any {
  return createNode('Row', props, { children: 'nodes' });
}
export function Select(props: any): any {
  return createNode('Select', props, {
    children: 'none',
    events: ['onChangeAction'],
  });
}
export function Text(props: any): any {
  return createNode('Text', props, {
    children: 'text',
    mapToProp: 'text',
    aliases: { value: 'text' },
  });
}
