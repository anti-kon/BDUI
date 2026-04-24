import { jsx as _jsx } from "@bdui/defs/web-renderers/jsx-runtime";
import { Component, props } from '../../define.js';
import { withWebContext } from '../../web-renderers/context.js';
import { IMAGE_CLASS } from './styles.js';
export const manifest = Component({
    name: 'Image',
    props: props('ImageProps'),
    events: [],
});
function sizeValue(v) {
    if (v == null)
        return undefined;
    return typeof v === 'number' ? `${v}px` : v;
}
const webRenderer = ({ node, context }) => withWebContext(context, () => {
    const src = typeof node.src === 'string' ? context.interpolate(node.src) : '';
    const alt = typeof node.alt === 'string' ? context.interpolate(node.alt) : '';
    const styles = {
        ...context.utils.cssForModifiers(node.modifiers),
        ...(node.fit ? { objectFit: node.fit } : {}),
        ...(node.width != null ? { width: sizeValue(node.width) } : {}),
        ...(node.height != null ? { height: sizeValue(node.height) } : {}),
    };
    return (_jsx("img", { className: IMAGE_CLASS, src: src, alt: alt, loading: node.loading ?? 'lazy', style: styles }));
});
export const definition = {
    manifest,
    renderers: { web: webRenderer },
};
export default definition;
//# sourceMappingURL=index.js.map