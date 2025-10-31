import { jsx as _jsx } from '@bdui/defs/web-renderers/jsx-runtime';
import { children, Component, props } from '../define.js';
import { composeStyles, withWebContext } from '../web-renderers/index.js';
export const manifest = Component({
  name: 'Column',
  props: props('ColumnProps'),
  children: children().nodes(),
  events: [],
});
const webRenderer = ({ node, context }) =>
  withWebContext(context, () =>
    _jsx('div', {
      style: composeStyles(
        {
          display: 'flex',
          flexDirection: 'column',
        },
        context.utils.cssForModifiers(node.modifiers),
      ),
      children: context.renderChildren(node.children),
    }),
  );
export const definition = {
  manifest,
  renderers: {
    web: webRenderer,
  },
};
export default definition;
