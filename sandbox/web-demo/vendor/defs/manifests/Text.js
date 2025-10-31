import { jsx as _jsx } from '@bdui/defs/web-renderers/jsx-runtime';
import { children, Component, props } from '../define.js';
import { composeStyles, withWebContext } from '../web-renderers/index.js';
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
    return _jsx('div', {
      style: composeStyles(context.utils.cssForModifiers(node.modifiers)),
      children: content,
    });
  });
export const definition = {
  manifest,
  renderers: {
    web: webRenderer,
  },
};
export default definition;
