import { children, Component, props } from '../../define.js';
import type {
  ComponentDefinition,
  ComponentNode,
  WebComponentRenderer,
} from '../../registry/types.js';
import { withWebContext } from '../../web-renderers/context.js';
import { COLUMN_CLASS } from './styles.js';

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
  withWebContext(context, () => {
    const styles = context.utils.cssForModifiers(node.modifiers) as Record<string, string | number>;
    return (
      <div className={COLUMN_CLASS} style={styles}>
        {context.renderChildren(node.children)}
      </div>
    );
  });

export const definition: ComponentDefinition<ColumnNode> = {
  manifest,
  renderers: {
    web: webRenderer,
  },
};

export default definition;
