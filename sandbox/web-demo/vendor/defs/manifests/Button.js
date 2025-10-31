import { jsx as _jsx } from '@bdui/defs/web-renderers/jsx-runtime';
import { Component, props } from '../define.js';
import { composeStyles, withWebContext } from '../web-renderers/index.js';
export const manifest = Component({
  name: 'Button',
  props: props('ButtonProps'),
  events: ['onAction'],
});
const webRenderer = ({ node, context }) =>
  withWebContext(context, () =>
    _jsx('button', {
      type: 'button',
      disabled: node.disabled,
      'data-state': node.loading ? 'loading' : undefined,
      onClick: () => context.runActions(node.onAction),
      style: composeStyles(
        {
          padding: '8px 12px',
          cursor: node.disabled ? 'not-allowed' : 'pointer',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          transition: 'background 0.2s ease',
        },
        context.utils.cssForModifiers(node.modifiers),
        node.modifiers?.variant === 'primary'
          ? { background: '#4F46E5', color: '#fff' }
          : { background: '#f3f4f6', color: '#111827' },
      ),
      children: context.format(node.title ?? 'Button'),
    }),
  );
export const definition = {
  manifest,
  renderers: {
    web: webRenderer,
  },
};
export default definition;
