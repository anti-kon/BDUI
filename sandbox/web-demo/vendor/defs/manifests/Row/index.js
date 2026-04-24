import { jsx as _jsx } from "@bdui/defs/web-renderers/jsx-runtime";
import { children, Component, props } from '../../define.js';
import { withWebContext } from '../../web-renderers/context.js';
import { ROW_CLASS } from './styles.js';
export const manifest = Component({
    name: 'Row',
    props: props('RowProps'),
    children: children().nodes(),
    events: [],
});
const webRenderer = ({ node, context }) => withWebContext(context, () => {
    const styles = {
        ...context.utils.cssForModifiers(node.modifiers),
        ...(node.gap != null
            ? { gap: typeof node.gap === 'number' ? `${node.gap}px` : node.gap }
            : {}),
        ...(node.wrap ? { flexWrap: 'wrap' } : {}),
    };
    return (_jsx("div", { className: ROW_CLASS, "data-align": node.align, "data-justify": node.justify, style: styles, children: context.renderChildren(node.children) }));
});
export const definition = {
    manifest,
    renderers: { web: webRenderer },
};
export default definition;
//# sourceMappingURL=index.js.map