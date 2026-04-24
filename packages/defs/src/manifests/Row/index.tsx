import { children, Component, props } from '../../define.js';
import type {
  ComponentDefinition,
  ComponentNode,
  WebComponentRenderer,
} from '../../registry/types.js';
import { withWebContext } from '../../web-renderers/context.js';
import { ROW_CLASS } from './styles.js';

export interface RowProps {
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: number | string;
  wrap?: boolean;
}

export type RowNode = ComponentNode<RowProps> & RowProps;

export const manifest = Component({
  name: 'Row',
  props: props<RowProps>('RowProps'),
  children: children().nodes(),
  events: [],
});

const webRenderer: WebComponentRenderer<RowNode> = ({ node, context }) =>
  withWebContext(context, () => {
    const styles = {
      ...context.utils.cssForModifiers(node.modifiers),
      ...(node.gap != null
        ? { gap: typeof node.gap === 'number' ? `${node.gap}px` : node.gap }
        : {}),
      ...(node.wrap ? { flexWrap: 'wrap' as const } : {}),
    } as Record<string, string | number>;

    return (
      <div className={ROW_CLASS} data-align={node.align} data-justify={node.justify} style={styles}>
        {context.renderChildren(node.children)}
      </div>
    );
  });

export const definition: ComponentDefinition<RowNode> = {
  manifest,
  renderers: { web: webRenderer },
};

export default definition;
