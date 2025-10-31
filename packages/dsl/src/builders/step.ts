import type { BDUIElement, FlowStep, FlowTransition } from '../types.js';
import { createNode, type Maybe, normalizeList, optionalList } from './shared.js';

type StepProps = {
  id: string;
  title?: string;
  children?: Maybe<BDUIElement | BDUIElement[]>;
  onEnter?: Maybe<any | any[]>;
  onExit?: Maybe<any | any[]>;
  onResume?: Maybe<any | any[]>;
  transitions?: Maybe<FlowTransition | FlowTransition[]>;
};

export function Step({ id, title, children, onEnter, onExit, onResume, transitions }: StepProps) {
  const childNodes = normalizeList<BDUIElement>(children);
  const step: FlowStep = {
    id,
    title,
    children: childNodes,
    onEnter: optionalList(onEnter),
    onExit: optionalList(onExit),
    onResume: optionalList(onResume),
    transitions: optionalList(transitions),
  };
  return createNode('Step', step);
}
