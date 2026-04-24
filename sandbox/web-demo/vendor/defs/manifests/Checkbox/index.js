import { jsx as _jsx, jsxs as _jsxs } from "@bdui/defs/web-renderers/jsx-runtime";
import { Component, props } from '../../define.js';
import { withWebContext } from '../../web-renderers/context.js';
import { CHECKBOX_CLASS, CHECKBOX_LABEL_CLASS } from './styles.js';
export const manifest = Component({
    name: 'Checkbox',
    props: props('CheckboxProps'),
    events: ['onChangeAction'],
});
const webRenderer = ({ node, context }) => withWebContext(context, () => {
    const checked = Boolean(node.binding ? context.readAt(node.binding.scope, node.binding.path) : false);
    const label = typeof node.label === 'string' ? context.interpolate(node.label) : null;
    const styles = context.utils.cssForModifiers(node.modifiers);
    return (_jsxs("label", { className: CHECKBOX_LABEL_CLASS, style: styles, children: [_jsx("input", { type: "checkbox", className: CHECKBOX_CLASS, disabled: Boolean(node.disabled), checked: checked, onChange: (event) => {
                    const target = event.target;
                    if (node.binding) {
                        context.writeAt(node.binding.scope, node.binding.path, target.checked);
                    }
                    context.runActions(node.onChangeAction);
                } }), label ? _jsx("span", { children: label }) : null] }));
});
export const definition = {
    manifest,
    renderers: { web: webRenderer },
};
export default definition;
//# sourceMappingURL=index.js.map