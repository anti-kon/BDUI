import { children, Component, props } from '../../define.js';
import type { ComponentDefinition, ComponentNode, WebComponentRenderer } from '../types.js';
import { composeStyles, withWebContext } from '../web/index.js';

export type RowProps = {
  id?: string;
  modifiers?: Record<string, unknown>;
};

export type RowNode = ComponentNode<RowProps>;

export const manifest = Component({
  name: 'Row',
  props: props<RowProps>('RowProps'),
  children: children().nodes(),
  events: [],
});

const webRenderer: WebComponentRenderer<RowNode> = ({ node, context }) =>
  withWebContext(context, () => (
    <div
      style={composeStyles(
        {
          display: 'flex',
          flexDirection: 'row',
        },
        context.utils.cssForModifiers(node.modifiers) as Record<string, string | number>,
      )}
    >
      {context.renderChildren(node.children)}
    </div>
  ));

export const definition: ComponentDefinition<RowNode> = {
  manifest,
  renderers: {
    web: webRenderer,
  },
};

export default definition;
