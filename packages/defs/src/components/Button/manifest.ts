import { Component, props } from '../../define.js';

export type ButtonProps = {
  id?: string;
  modifiers?: Record<string, unknown>;
  title: string;
  disabled?: boolean;
  loading?: boolean;
  onAction?: any[];
};

export default Component({
  name: 'Button',
  props: props<ButtonProps>('ButtonProps'),
  events: ['onAction'], // children omitted — defaults to none
});
