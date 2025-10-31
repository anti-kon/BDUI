import { jsx as _jsx } from '@bdui/defs/web-renderers/jsx-runtime';
import { Component, props } from '../../define.js';
import { withWebContext } from '../../web-renderers/context.js';
import { BUTTON_BASE_CLASS, BUTTON_PRIMARY_CLASS, BUTTON_SECONDARY_CLASS } from './styles.js';
export const manifest = Component({
  name: 'Button',
  props: props('ButtonProps'),
  events: ['onAction'],
});
function resolveClassName(node) {
  const classes = [BUTTON_BASE_CLASS];
  const variant =
    node.modifiers?.variant === 'primary' ? BUTTON_PRIMARY_CLASS : BUTTON_SECONDARY_CLASS;
  if (variant) classes.push(variant);
  return classes.join(' ');
}
const webRenderer = ({ node, context }) =>
  withWebContext(context, () => {
    const className = resolveClassName(node);
    const inlineStyles = context.utils.cssForModifiers(node.modifiers);
    return _jsx('button', {
      type: 'button',
      disabled: node.disabled,
      'data-state': node.loading ? 'loading' : undefined,
      onClick: () => context.runActions(node.onAction),
      className: className,
      style: inlineStyles,
      children: context.format(node.title ?? 'Button'),
    });
  });
export const definition = {
  manifest,
  renderers: {
    web: webRenderer,
  },
};
export default definition;
