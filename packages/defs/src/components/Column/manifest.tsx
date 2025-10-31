import { children, Component, props } from '../../define.js';
import type { ComponentDefinition, ComponentNode, WebComponentRenderer } from '../types.js';
import { composeStyles, withWebContext } from '../web/index.js';

export type ColumnProps = {
  id?: string;
  modifiers?: Record<string, unknown>;
};

export type ColumnNode = ComponentNode<ColumnProps>;

export const manifest = Component({
  name: 'Column',
  props: props<ColumnProps>('ColumnProps'),
  children: children().nodes(),
  events: [],
});

const webRenderer: WebComponentRenderer<ColumnNode> = ({ node, context }) =>
  withWebContext(context, () => (
    <div
      style={composeStyles(
        {
          display: 'flex',
          flexDirection: 'column',
        },
        context.utils.cssForModifiers(node.modifiers) as Record<string, string | number>,
      )}
    >
      {context.renderChildren(node.children)}
    </div>
  ));

export const definition: ComponentDefinition<ColumnNode> = {
  manifest,
  renderers: {
    web: webRenderer,
  },
};

export default definition;
