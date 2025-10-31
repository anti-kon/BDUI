import { Component, props } from '../../define.js';
import type {
  ComponentDefinition,
  ComponentNode,
  WebComponentRenderer,
} from '../../registry/types.js';
import { withWebContext } from '../../web-renderers/context.js';
import { BUTTON_BASE_CLASS, BUTTON_PRIMARY_CLASS, BUTTON_SECONDARY_CLASS } from './styles.js';

export type ButtonProps = {
  id?: string;
  modifiers?: Record<string, unknown>;
  title: string;
  disabled?: boolean;
  loading?: boolean;
  onAction?: any[];
};

export type ButtonNode = ComponentNode<ButtonProps>;

export const manifest = Component({
  name: 'Button',
  props: props<ButtonProps>('ButtonProps'),
  events: ['onAction'],
});

function resolveClassName(node: ButtonNode): string {
  const classes = [BUTTON_BASE_CLASS];
  const variant =
    node.modifiers?.variant === 'primary' ? BUTTON_PRIMARY_CLASS : BUTTON_SECONDARY_CLASS;
  if (variant) classes.push(variant);
  return classes.join(' ');
}

const webRenderer: WebComponentRenderer<ButtonNode> = ({ node, context }) =>
  withWebContext(context, () => {
    const className = resolveClassName(node);
    const inlineStyles = context.utils.cssForModifiers(node.modifiers) as Record<
      string,
      string | number
    >;

    return (
      <button
        type="button"
        disabled={node.disabled}
        data-state={node.loading ? 'loading' : undefined}
        onClick={() => context.runActions(node.onAction)}
        className={className}
        style={inlineStyles}
      >
        {context.format(node.title ?? 'Button')}
      </button>
    );
  });

export const definition: ComponentDefinition<ButtonNode> = {
  manifest,
  renderers: {
    web: webRenderer,
  },
};

export default definition;
