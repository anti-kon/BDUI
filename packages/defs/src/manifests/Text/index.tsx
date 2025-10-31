import { children, Component, props } from '../../define.js';
import type {
  ComponentDefinition,
  ComponentNode,
  WebComponentRenderer,
} from '../../registry/types.js';
import { withWebContext } from '../../web-renderers/context.js';
import { TEXT_CLASS } from './styles.js';

export type TextProps = {
  id?: string;
  modifiers?: Record<string, unknown>;
  text?: unknown;
  value?: unknown;
};

export type TextNode = ComponentNode<TextProps>;

export const manifest = Component({
  name: 'Text',
  props: props<TextProps>('TextProps'),
  children: children().text({ mapToProp: 'text', required: false }),
  aliases: { value: 'text' },
  events: [],
});

const webRenderer: WebComponentRenderer<TextNode> = ({ node, context }) =>
  withWebContext(context, () => {
    const raw = node.text ?? node.value;
    const content = typeof raw === 'string' ? context.interpolate(raw) : context.format(raw);
    const styles = context.utils.cssForModifiers(node.modifiers) as Record<string, string | number>;

    return (
      <span className={TEXT_CLASS} style={styles}>
        {content}
      </span>
    );
  });

export const definition: ComponentDefinition<TextNode> = {
  manifest,
  renderers: {
    web: webRenderer,
  },
};

export default definition;
