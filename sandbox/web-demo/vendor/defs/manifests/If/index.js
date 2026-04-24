import { children, Component, props } from '../../define.js';
import { withWebContext } from '../../web-renderers/context.js';
export const manifest = Component({
    name: 'If',
    props: props('IfProps'),
    children: children().nodes(),
    events: [],
});
const webRenderer = ({ node, context }) => withWebContext(context, () => {
    const resolved = context.resolve(node.condition);
    const show = Boolean(resolved);
    const doc = context.document;
    if (!show) {
        const placeholder = doc.createElement('template');
        placeholder.setAttribute('data-bdui-if', 'hidden');
        return placeholder;
    }
    const fragmentHost = doc.createElement('div');
    fragmentHost.setAttribute('data-bdui-if', 'visible');
    fragmentHost.style.display = 'contents';
    for (const child of context.renderChildren(node.children)) {
        fragmentHost.appendChild(child);
    }
    return fragmentHost;
});
export const definition = {
    manifest,
    renderers: { web: webRenderer },
};
export default definition;
//# sourceMappingURL=index.js.map