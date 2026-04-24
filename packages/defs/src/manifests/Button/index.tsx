import type { Action } from '@bdui/core';

import { Component, props } from '../../define.js';
import type {
  ComponentDefinition,
  ComponentNode,
  WebComponentRenderer,
} from '../../registry/types.js';
import { withWebContext } from '../../web-renderers/context.js';
import { BUTTON_BASE_CLASS, BUTTON_PRIMARY_CLASS, BUTTON_SECONDARY_CLASS } from './styles.js';

export interface ButtonProps {
  title: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  onAction?: readonly Action[];
}

export type ButtonNode = ComponentNode<ButtonProps> & ButtonProps;

export const manifest = Component({
  name: 'Button',
  props: props<ButtonProps>('ButtonProps'),
  events: ['onAction'],
});

function resolveClassName(node: ButtonNode): string {
  const classes = [BUTTON_BASE_CLASS];
  const variant = node.variant ?? node.modifiers?.variant;
  if (variant === 'primary') classes.push(BUTTON_PRIMARY_CLASS);
  else classes.push(BUTTON_SECONDARY_CLASS);
  return classes.join(' ');
}

const webRenderer: WebComponentRenderer<ButtonNode> = ({ node, context }) =>
  withWebContext(context, () => {
    const className = resolveClassName(node);
    const inlineStyles = context.utils.cssForModifiers(node.modifiers);
    const title =
      typeof node.title === 'string'
        ? context.interpolate(node.title)
        : context.format(node.title ?? 'Button');

    return (
      <button
        type="button"
        disabled={Boolean(node.disabled)}
        data-state={node.loading ? 'loading' : undefined}
        onClick={() => context.runActions(node.onAction)}
        className={className}
        style={inlineStyles as Record<string, string | number>}
      >
        {title}
      </button>
    );
  });

export const definition: ComponentDefinition<ButtonNode> = {
  manifest,
  renderers: { web: webRenderer },
};

export default definition;
