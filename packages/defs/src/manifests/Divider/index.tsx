import { Component, props } from '../../define.js';
import type {
  ComponentDefinition,
  ComponentNode,
  WebComponentRenderer,
} from '../../registry/types.js';
import { withWebContext } from '../../web-renderers/context.js';
import { DIVIDER_CLASS } from './styles.js';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
}

export type DividerNode = ComponentNode<DividerProps> & DividerProps;

export const manifest = Component({
  name: 'Divider',
  props: props<DividerProps>('DividerProps'),
  events: [],
});

const webRenderer: WebComponentRenderer<DividerNode> = ({ node, context }) =>
  withWebContext(context, () => {
    const orientation = node.orientation ?? 'horizontal';
    const thickness = typeof node.thickness === 'number' ? `${node.thickness}px` : '1px';
    const color = node.color ?? 'currentColor';
    const styles = {
      ...context.utils.cssForModifiers(node.modifiers),
      ...(orientation === 'horizontal'
        ? { width: '100%', height: thickness, backgroundColor: color }
        : { height: '100%', width: thickness, backgroundColor: color }),
    } as Record<string, string | number>;

    return (
      <div
        className={DIVIDER_CLASS}
        data-orientation={orientation}
        role="separator"
        aria-orientation={orientation}
        style={styles}
      />
    );
  });

export const definition: ComponentDefinition<DividerNode> = {
  manifest,
  renderers: { web: webRenderer },
};

export default definition;
