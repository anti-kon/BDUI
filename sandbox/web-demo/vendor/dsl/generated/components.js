// AUTO-GENERATED. Do not edit.
import { createNode } from '../glue/runtime.js';
export function Text(props) {
  return createNode('Text', props, {
    children: 'text',
    mapToProp: 'text',
    aliases: { value: 'text' },
  });
}
export function Button(props) {
  return createNode('Button', props, { children: 'none' });
}
export function Row(props) {
  return createNode('Row', props, { children: 'nodes' });
}
export function Column(props) {
  return createNode('Column', props, { children: 'nodes' });
}
