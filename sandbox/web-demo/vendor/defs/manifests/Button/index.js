import { jsx as _jsx } from "@bdui/defs/web-renderers/jsx-runtime";
import { Component, props } from '../../define.js';
import { withWebContext } from '../../web-renderers/context.js';
import { BUTTON_BASE_CLASS, BUTTON_PRIMARY_CLASS, BUTTON_SECONDARY_CLASS } from './styles.js';
export const manifest = Component({
    name: 'Button',
    props: props('ButtonProps'),
    events: ['onAction'],
});
function resolveClassName(node) {
    const classes = [BUTTON_BASE_CLASS];
    const variant = node.variant ?? node.modifiers?.variant;
    if (variant === 'primary')
        classes.push(BUTTON_PRIMARY_CLASS);
    else
        classes.push(BUTTON_SECONDARY_CLASS);
    return classes.join(' ');
}
const webRenderer = ({ node, context }) => withWebContext(context, () => {
    const className = resolveClassName(node);
    const inlineStyles = context.utils.cssForModifiers(node.modifiers);
    const title = typeof node.title === 'string'
        ? context.interpolate(node.title)
        : context.format(node.title ?? 'Button');
    return (_jsx("button", { type: "button", disabled: Boolean(node.disabled), "data-state": node.loading ? 'loading' : undefined, onClick: () => context.runActions(node.onAction), className: className, style: inlineStyles, children: title }));
});
export const definition = {
    manifest,
    renderers: { web: webRenderer },
};
export default definition;
//# sourceMappingURL=index.js.map