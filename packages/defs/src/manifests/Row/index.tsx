import { children, Component, props } from '../../define.js';
import type {
  ComponentDefinition,
  ComponentNode,
  WebComponentRenderer,
} from '../../registry/types.js';
import { withWebContext } from '../../web-renderers/context.js';
import { ROW_CLASS } from './styles.js';

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
  withWebContext(context, () => {
    const styles = context.utils.cssForModifiers(node.modifiers) as Record<string, string | number>;
    return (
      <div className={ROW_CLASS} style={styles}>
        {context.renderChildren(node.children)}
      </div>
    );
  });

export const definition: ComponentDefinition<RowNode> = {
  manifest,
  renderers: {
    web: webRenderer,
  },
};

export default definition;
