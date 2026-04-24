import type { Action, Binding } from '@bdui/core';

import { Component, props } from '../../define.js';
import type {
  ComponentDefinition,
  ComponentNode,
  WebComponentRenderer,
} from '../../registry/types.js';
import { withWebContext } from '../../web-renderers/context.js';
import { CHECKBOX_CLASS, CHECKBOX_LABEL_CLASS } from './styles.js';

export interface CheckboxProps {
  binding: Binding;
  label?: string;
  disabled?: boolean;
  onChangeAction?: readonly Action[];
}

export type CheckboxNode = ComponentNode<CheckboxProps> & CheckboxProps;

export const manifest = Component({
  name: 'Checkbox',
  props: props<CheckboxProps>('CheckboxProps'),
  events: ['onChangeAction'],
});

const webRenderer: WebComponentRenderer<CheckboxNode> = ({ node, context }) =>
  withWebContext(context, () => {
    const checked = Boolean(
      node.binding ? context.readAt(node.binding.scope, node.binding.path) : false,
    );
    const label = typeof node.label === 'string' ? context.interpolate(node.label) : null;
    const styles = context.utils.cssForModifiers(node.modifiers);

    return (
      <label className={CHECKBOX_LABEL_CLASS} style={styles as Record<string, string | number>}>
        <input
          type="checkbox"
          className={CHECKBOX_CLASS}
          disabled={Boolean(node.disabled)}
          checked={checked}
          onChange={(event: Event) => {
            const target = event.target as HTMLInputElement;
            if (node.binding) {
              context.writeAt(node.binding.scope, node.binding.path, target.checked);
            }
            context.runActions(node.onChangeAction);
          }}
        />
        {label ? <span>{label}</span> : null}
      </label>
    );
  });

export const definition: ComponentDefinition<CheckboxNode> = {
  manifest,
  renderers: { web: webRenderer },
};

export default definition;
