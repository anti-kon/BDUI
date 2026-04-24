import type { Action, Binding } from '@bdui/core';

import { Component, props } from '../../define.js';
import type {
  ComponentDefinition,
  ComponentNode,
  WebComponentRenderer,
} from '../../registry/types.js';
import { withWebContext } from '../../web-renderers/context.js';
import { SELECT_CLASS } from './styles.js';

export interface SelectOption {
  readonly value: string | number;
  readonly label: string;
  readonly disabled?: boolean;
}

export interface SelectProps {
  binding: Binding;
  options: readonly SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  onChangeAction?: readonly Action[];
}

export type SelectNode = ComponentNode<SelectProps> & SelectProps;

export const manifest = Component({
  name: 'Select',
  props: props<SelectProps>('SelectProps'),
  events: ['onChangeAction'],
});

const webRenderer: WebComponentRenderer<SelectNode> = ({ node, context }) =>
  withWebContext(context, () => {
    const currentValue = node.binding ? context.readAt(node.binding.scope, node.binding.path) : '';
    const styles = context.utils.cssForModifiers(node.modifiers);
    const options = Array.isArray(node.options) ? node.options : [];
    const placeholder =
      typeof node.placeholder === 'string' ? context.interpolate(node.placeholder) : undefined;

    return (
      <select
        className={SELECT_CLASS}
        disabled={Boolean(node.disabled)}
        value={currentValue == null ? '' : String(currentValue)}
        onChange={(event: Event) => {
          const target = event.target as HTMLSelectElement;
          const raw = target.value;
          const match = options.find((o) => String(o.value) === raw);
          const nextValue = match ? match.value : raw;
          if (node.binding) {
            context.writeAt(node.binding.scope, node.binding.path, nextValue);
          }
          context.runActions(node.onChangeAction);
        }}
        style={styles as Record<string, string | number>}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)} disabled={opt.disabled}>
            {context.interpolate(opt.label)}
          </option>
        ))}
      </select>
    );
  });

export const definition: ComponentDefinition<SelectNode> = {
  manifest,
  renderers: { web: webRenderer },
};

export default definition;
