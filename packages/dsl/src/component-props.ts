import type { Action, BDUIElement, Modifiers } from '@bdui/core';

import type { ShortAction } from './actions-normalize.js';

export type ActionInput = ShortAction | Action | readonly (ShortAction | Action)[];

export type NodeChild = BDUIElement | false | null | undefined;
export type NodeChildren = NodeChild | readonly NodeChildren[];

export type TextChildren = unknown;

export interface SharedNodeProps {
  readonly id?: string;
  readonly modifiers?: Modifiers;
}

export type WithActionEvents<TProps, TEvent extends PropertyKey = never> = Omit<
  TProps,
  Extract<TEvent, keyof TProps>
> & {
  readonly [K in TEvent]?: ActionInput;
};

export type NoChildrenProps<TProps, TEvent extends PropertyKey = never> = SharedNodeProps &
  WithActionEvents<TProps, TEvent> & {
    readonly children?: never;
  };

export type NodeChildrenProps<TProps, TEvent extends PropertyKey = never> = SharedNodeProps &
  WithActionEvents<TProps, TEvent> & {
    readonly children?: NodeChildren;
  };

export type TextChildrenProps<TProps, TEvent extends PropertyKey = never> = SharedNodeProps &
  WithActionEvents<TProps, TEvent> & {
    readonly children?: TextChildren;
  };
