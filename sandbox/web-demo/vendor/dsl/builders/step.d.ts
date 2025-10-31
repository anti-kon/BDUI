import type { BDUIElement, FlowStep, FlowTransition } from '../types.js';
import { type Maybe } from './shared.js';
type StepProps = {
  id: string;
  title?: string;
  children?: Maybe<BDUIElement | BDUIElement[]>;
  onEnter?: Maybe<any | any[]>;
  onExit?: Maybe<any | any[]>;
  onResume?: Maybe<any | any[]>;
  transitions?: Maybe<FlowTransition | FlowTransition[]>;
};
export declare function Step({
  id,
  title,
  children,
  onEnter,
  onExit,
  onResume,
  transitions,
}: StepProps): import('./shared.js').DslNode<'Step', FlowStep>;
export {};
