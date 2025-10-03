import { Component, props, children } from '../../define.js';

export type ColumnProps = {
  id?: string;
  modifiers?: Record<string, unknown>;
};

export default Component({
  name: 'Column',
  props: props<ColumnProps>('ColumnProps'),
  children: children().nodes(),
  events: []
});
