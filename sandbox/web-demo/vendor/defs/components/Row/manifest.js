import { jsx as _jsx } from '@bdui/defs/components/web/jsx-runtime';
import { children, Component, props } from '../../define.js';
import { composeStyles, withWebContext } from '../web/index.js';
export const manifest = Component({
  name: 'Row',
  props: props('RowProps'),
  children: children().nodes(),
  events: [],
});
const webRenderer = ({ node, context }) =>
  withWebContext(context, () =>
    _jsx('div', {
      style: composeStyles(
        {
          display: 'flex',
          flexDirection: 'row',
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
