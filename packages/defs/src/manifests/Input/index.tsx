import type { Action, Binding } from '@bdui/core';

import { Component, props } from '../../define.js';
import type {
  ComponentDefinition,
  ComponentNode,
  WebComponentRenderer,
} from '../../registry/types.js';
import { withWebContext } from '../../web-renderers/context.js';
import { INPUT_CLASS } from './styles.js';

export type InputType = 'text' | 'number' | 'email' | 'password' | 'tel' | 'url';

export interface InputProps {
  binding: Binding;
  placeholder?: string;
  inputType?: InputType;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  maxLength?: number;
  onChangeAction?: readonly Action[];
  onBlurAction?: readonly Action[];
}

export type InputNode = ComponentNode<InputProps> & InputProps;

export const manifest = Component({
  name: 'Input',
  props: props<InputProps>('InputProps'),
  events: ['onChangeAction', 'onBlurAction'],
});

const webRenderer: WebComponentRenderer<InputNode> = ({ node, context }) =>
  withWebContext(context, () => {
    const styles = context.utils.cssForModifiers(node.modifiers);
    const currentValue = node.binding ? context.readAt(node.binding.scope, node.binding.path) : '';
    const placeholder =
      typeof node.placeholder === 'string' ? context.interpolate(node.placeholder) : undefined;

    return (
      <input
        type={node.inputType ?? 'text'}
        className={INPUT_CLASS}
        disabled={Boolean(node.disabled)}
        readOnly={Boolean(node.readOnly)}
        placeholder={placeholder}
        autoComplete={node.autoComplete}
        maxLength={node.maxLength}
        value={currentValue == null ? '' : String(currentValue)}
        onInput={(event: Event) => {
          const target = event.target as HTMLInputElement;
          const nextValue =
            node.inputType === 'number'
              ? target.value === ''
                ? null
                : Number(target.value)
              : target.value;
          if (node.binding) {
            context.writeAt(node.binding.scope, node.binding.path, nextValue);
          }
          context.runActions(node.onChangeAction);
        }}
        onBlur={() => context.runActions(node.onBlurAction)}
        style={styles as Record<string, string | number>}
      />
    );
  });

export const definition: ComponentDefinition<InputNode> = {
  manifest,
  renderers: { web: webRenderer },
};

export default definition;
