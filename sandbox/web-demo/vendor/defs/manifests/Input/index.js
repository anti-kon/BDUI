import { jsx as _jsx } from "@bdui/defs/web-renderers/jsx-runtime";
import { Component, props } from '../../define.js';
import { withWebContext } from '../../web-renderers/context.js';
import { INPUT_CLASS } from './styles.js';
export const manifest = Component({
    name: 'Input',
    props: props('InputProps'),
    events: ['onChangeAction', 'onBlurAction'],
});
const webRenderer = ({ node, context }) => withWebContext(context, () => {
    const styles = context.utils.cssForModifiers(node.modifiers);
    const currentValue = node.binding ? context.readAt(node.binding.scope, node.binding.path) : '';
    const placeholder = typeof node.placeholder === 'string' ? context.interpolate(node.placeholder) : undefined;
    return (_jsx("input", { type: node.inputType ?? 'text', className: INPUT_CLASS, disabled: Boolean(node.disabled), readOnly: Boolean(node.readOnly), placeholder: placeholder, autoComplete: node.autoComplete, maxLength: node.maxLength, value: currentValue == null ? '' : String(currentValue), onInput: (event) => {
            const target = event.target;
            const nextValue = node.inputType === 'number'
                ? target.value === ''
                    ? null
                    : Number(target.value)
                : target.value;
            if (node.binding) {
                context.writeAt(node.binding.scope, node.binding.path, nextValue);
            }
            context.runActions(node.onChangeAction);
        }, onBlur: () => context.runActions(node.onBlurAction), style: styles }));
});
export const definition = {
    manifest,
    renderers: { web: webRenderer },
};
export default definition;
//# sourceMappingURL=index.js.map