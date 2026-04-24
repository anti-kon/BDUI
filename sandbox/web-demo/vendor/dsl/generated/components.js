// AUTO-GENERATED. Do not edit.
import { createNode } from '../glue/runtime.js';
export function Button(props) {
    return createNode('Button', props, {
        children: 'none',
        events: ['onAction'],
    });
}
export function Checkbox(props) {
    return createNode('Checkbox', props, {
        children: 'none',
        events: ['onChangeAction'],
    });
}
export function Column(props) {
    return createNode('Column', props, { children: 'nodes' });
}
export function Divider(props) {
    return createNode('Divider', props, { children: 'none' });
}
export function If(props) {
    return createNode('If', props, { children: 'nodes' });
}
export function Image(props) {
    return createNode('Image', props, { children: 'none' });
}
export function Input(props) {
    return createNode('Input', props, {
        children: 'none',
        events: ['onChangeAction', 'onBlurAction'],
    });
}
export function Row(props) {
    return createNode('Row', props, { children: 'nodes' });
}
export function Select(props) {
    return createNode('Select', props, {
        children: 'none',
        events: ['onChangeAction'],
    });
}
export function Text(props) {
    return createNode('Text', props, {
        children: 'text',
        mapToProp: 'text',
        aliases: { value: 'text' },
    });
}
//# sourceMappingURL=components.js.map