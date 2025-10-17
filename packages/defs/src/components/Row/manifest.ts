import { children, Component, props } from '../../define.js';

export type RowProps = {
  id?: string;
  modifiers?: Record<string, unknown>;
};

export default Component({
  name: 'Row',
  props: props<RowProps>('RowProps'),
  children: children().nodes(),
  events: [],
});
