import { children, Component, props } from '../../define.js';
import type {
  ComponentDefinition,
  ComponentNode,
  WebComponentRenderer,
} from '../../registry/types.js';
import { withWebContext } from '../../web-renderers/context.js';
import { COLUMN_CLASS } from './styles.js';

export interface ColumnProps {
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: number | string;
}

export type ColumnNode = ComponentNode<ColumnProps> & ColumnProps;

export const manifest = Component({
  name: 'Column',
  props: props<ColumnProps>('ColumnProps'),
  children: children().nodes(),
  events: [],
});

const webRenderer: WebComponentRenderer<ColumnNode> = ({ node, context }) =>
  withWebContext(context, () => {
    const styles = {
      ...context.utils.cssForModifiers(node.modifiers),
      ...(node.gap != null
        ? { gap: typeof node.gap === 'number' ? `${node.gap}px` : node.gap }
        : {}),
    } as Record<string, string | number>;

    return (
      <div
        className={COLUMN_CLASS}
        data-align={node.align}
        data-justify={node.justify}
        style={styles}
      >
        {context.renderChildren(node.children)}
      </div>
    );
  });

export const definition: ComponentDefinition<ColumnNode> = {
  manifest,
  renderers: { web: webRenderer },
};

export default definition;
