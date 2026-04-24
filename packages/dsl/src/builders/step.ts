import type { Action, BDUIElement, FlowStep, FlowTransition } from '@bdui/core';

import { normalizeActions, type ShortAction } from '../actions-normalize.js';
import { createNode, type Maybe, normalizeList, optionalList } from './shared.js';

export interface StepProps {
  id: string;
  title?: string;
  children?: Maybe<BDUIElement | readonly BDUIElement[]>;
  onEnter?: Maybe<ShortAction | Action | readonly (ShortAction | Action)[]>;
  onExit?: Maybe<ShortAction | Action | readonly (ShortAction | Action)[]>;
  onResume?: Maybe<ShortAction | Action | readonly (ShortAction | Action)[]>;
  transitions?: Maybe<FlowTransition | readonly FlowTransition[]>;
}

function normActionsMaybe(
  input: Maybe<ShortAction | Action | readonly (ShortAction | Action)[]>,
): readonly Action[] | undefined {
  const list = optionalList(input);
  if (!list) return undefined;
  return normalizeActions(list as readonly (ShortAction | Action)[]);
}

export function Step({ id, title, children, onEnter, onExit, onResume, transitions }: StepProps) {
  const childNodes = normalizeList<BDUIElement>(children);
  const step: FlowStep = {
    id,
    title,
    children: childNodes,
    onEnter: normActionsMaybe(onEnter),
    onExit: normActionsMaybe(onExit),
    onResume: normActionsMaybe(onResume),
    transitions: optionalList(transitions),
  };
  return createNode('Step', step);
}
