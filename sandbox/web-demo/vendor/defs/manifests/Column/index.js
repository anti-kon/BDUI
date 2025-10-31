import { jsx as _jsx } from '@bdui/defs/web-renderers/jsx-runtime';
import { children, Component, props } from '../../define.js';
import { withWebContext } from '../../web-renderers/context.js';
import { COLUMN_CLASS } from './styles.js';
export const manifest = Component({
  name: 'Column',
  props: props('ColumnProps'),
  children: children().nodes(),
  events: [],
});
const webRenderer = ({ node, context }) =>
  withWebContext(context, () => {
    const styles = context.utils.cssForModifiers(node.modifiers);
    return _jsx('div', {
      className: COLUMN_CLASS,
      style: styles,
      children: context.renderChildren(node.children),
    });
  });
export const definition = {
  manifest,
  renderers: {
    web: webRenderer,
  },
};
export default definition;
