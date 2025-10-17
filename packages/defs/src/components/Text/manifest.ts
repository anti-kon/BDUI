import { children, Component, props } from '../../define.js';

export type TextProps = {
  id?: string;
  modifiers?: Record<string, unknown>;
  value?: string;
};

export default Component({
  name: 'Text',
  props: props<TextProps>('TextProps'),
  children: children().text({ mapToProp: 'text', required: false }),
  aliases: { value: 'text' },
  events: [],
});
