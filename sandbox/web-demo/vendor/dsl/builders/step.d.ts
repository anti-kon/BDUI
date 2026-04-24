import type { Action, BDUIElement, FlowStep, FlowTransition } from '@bdui/core';
import { type ShortAction } from '../actions-normalize.js';
import { type Maybe } from './shared.js';
export interface StepProps {
    id: string;
    title?: string;
    children?: Maybe<BDUIElement | readonly BDUIElement[]>;
    onEnter?: Maybe<ShortAction | Action | readonly (ShortAction | Action)[]>;
    onExit?: Maybe<ShortAction | Action | readonly (ShortAction | Action)[]>;
    onResume?: Maybe<ShortAction | Action | readonly (ShortAction | Action)[]>;
    transitions?: Maybe<FlowTransition | readonly FlowTransition[]>;
}
export declare function Step({ id, title, children, onEnter, onExit, onResume, transitions }: StepProps): import("./shared.js").DslNode<"Step", FlowStep>;
//# sourceMappingURL=step.d.ts.map