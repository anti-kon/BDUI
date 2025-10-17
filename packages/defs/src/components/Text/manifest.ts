import { children, Component, props } from '../../define.js';

export type TextProps = {
  id?: string;
  modifiers?: Record<string, unknown>;
  /** alias if you prefer <Text value="..."/> instead of children */
  value?: string; // alias to JSON 'text'
};

export default Component({
  name: 'Text',
  props: props<TextProps>('TextProps'),
  children: children().text({ mapToProp: 'text', required: false }),
  aliases: { value: 'text' },
  events: [],
});
