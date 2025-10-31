import type { FlowRouteScreen, FlowStep, RuntimeStateLike } from './types.js';
export type FlowResolution = {
  step: FlowStep;
  stepId: string;
};
export declare function resolveFlowStep(
  route: FlowRouteScreen,
  state?: RuntimeStateLike,
  currentStepId?: string,
): FlowResolution;
export declare function clearGuardCache(): void;
