import { jsx as _jsx } from '@bdui/defs/web-renderers/jsx-runtime';
import { children, Component, props } from '../../define.js';
import { withWebContext } from '../../web-renderers/context.js';
import { TEXT_CLASS } from './styles.js';
export const manifest = Component({
  name: 'Text',
  props: props('TextProps'),
  children: children().text({ mapToProp: 'text', required: false }),
  aliases: { value: 'text' },
  events: [],
});
const webRenderer = ({ node, context }) =>
  withWebContext(context, () => {
    const raw = node.text ?? node.value;
    const content = typeof raw === 'string' ? context.interpolate(raw) : context.format(raw);
    const styles = context.utils.cssForModifiers(node.modifiers);
    return _jsx('span', { className: TEXT_CLASS, style: styles, children: content });
  });
export const definition = {
  manifest,
  renderers: {
    web: webRenderer,
  },
};
export default definition;
