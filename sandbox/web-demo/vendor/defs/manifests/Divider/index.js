import { jsx as _jsx } from "@bdui/defs/web-renderers/jsx-runtime";
import { Component, props } from '../../define.js';
import { withWebContext } from '../../web-renderers/context.js';
import { DIVIDER_CLASS } from './styles.js';
export const manifest = Component({
    name: 'Divider',
    props: props('DividerProps'),
    events: [],
});
const webRenderer = ({ node, context }) => withWebContext(context, () => {
    const orientation = node.orientation ?? 'horizontal';
    const thickness = typeof node.thickness === 'number' ? `${node.thickness}px` : '1px';
    const color = node.color ?? 'currentColor';
    const styles = {
        ...context.utils.cssForModifiers(node.modifiers),
        ...(orientation === 'horizontal'
            ? { width: '100%', height: thickness, backgroundColor: color }
            : { height: '100%', width: thickness, backgroundColor: color }),
    };
    return (_jsx("div", { className: DIVIDER_CLASS, "data-orientation": orientation, role: "separator", "aria-orientation": orientation, style: styles }));
});
export const definition = {
    manifest,
    renderers: { web: webRenderer },
};
export default definition;
//# sourceMappingURL=index.js.map