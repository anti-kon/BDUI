// AUTO-GENERATED. Do not edit.
import { createNode } from '../glue/runtime.js';

export function Text(props: any): any {
  return createNode('Text', props, {
    children: 'text',
    mapToProp: 'text',
    aliases: { value: 'text' },
  });
}
export function Button(props: any): any {
  return createNode('Button', props, { children: 'none' });
}
export function Row(props: any): any {
  return createNode('Row', props, { children: 'nodes' });
}
export function Column(props: any): any {
  return createNode('Column', props, { children: 'nodes' });
}
