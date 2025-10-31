import { Component, props } from '../../define.js';
import type { ComponentDefinition, ComponentNode, WebComponentRenderer } from '../types.js';
import { composeStyles, withWebContext } from '../web/index.js';

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

const webRenderer: WebComponentRenderer<ButtonNode> = ({ node, context }) =>
  withWebContext(context, () => (
    <button
      type="button"
      disabled={node.disabled}
      data-state={node.loading ? 'loading' : undefined}
      onClick={() => context.runActions(node.onAction)}
      style={composeStyles(
        {
          padding: '8px 12px',
          cursor: node.disabled ? 'not-allowed' : 'pointer',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          transition: 'background 0.2s ease',
        },
        context.utils.cssForModifiers(node.modifiers) as Record<string, string>,
        node.modifiers?.variant === 'primary'
          ? { background: '#4F46E5', color: '#fff' }
          : { background: '#f3f4f6', color: '#111827' },
      )}
    >
      {context.format(node.title ?? 'Button')}
    </button>
  ));

export const definition: ComponentDefinition<ButtonNode> = {
  manifest,
  renderers: {
    web: webRenderer,
  },
};

export default definition;
