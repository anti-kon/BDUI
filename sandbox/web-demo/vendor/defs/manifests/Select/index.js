import { jsx as _jsx, jsxs as _jsxs } from "@bdui/defs/web-renderers/jsx-runtime";
import { Component, props } from '../../define.js';
import { withWebContext } from '../../web-renderers/context.js';
import { SELECT_CLASS } from './styles.js';
export const manifest = Component({
    name: 'Select',
    props: props('SelectProps'),
    events: ['onChangeAction'],
});
const webRenderer = ({ node, context }) => withWebContext(context, () => {
    const currentValue = node.binding ? context.readAt(node.binding.scope, node.binding.path) : '';
    const styles = context.utils.cssForModifiers(node.modifiers);
    const options = Array.isArray(node.options) ? node.options : [];
    const placeholder = typeof node.placeholder === 'string' ? context.interpolate(node.placeholder) : undefined;
    return (_jsxs("select", { className: SELECT_CLASS, disabled: Boolean(node.disabled), value: currentValue == null ? '' : String(currentValue), onChange: (event) => {
            const target = event.target;
            const raw = target.value;
            const match = options.find((o) => String(o.value) === raw);
            const nextValue = match ? match.value : raw;
            if (node.binding) {
                context.writeAt(node.binding.scope, node.binding.path, nextValue);
            }
            context.runActions(node.onChangeAction);
        }, style: styles, children: [placeholder ? (_jsx("option", { value: "", disabled: true, children: placeholder })) : null, options.map((opt) => (_jsx("option", { value: String(opt.value), disabled: opt.disabled, children: context.interpolate(opt.label) }, String(opt.value))))] }));
});
export const definition = {
    manifest,
    renderers: { web: webRenderer },
};
export default definition;
//# sourceMappingURL=index.js.map