import type { Action } from './action.js';
import type { ExprRef } from './expr.js';
import type { BDUIElement } from './node.js';

/** Guarded transition between two flow steps. */
export interface FlowTransition {
  readonly to: string;
  /** Guard expression (must evaluate truthy). */
  readonly guard?: ExprRef;
}

/** Single step within a flow. */
export interface FlowStep {
  readonly id: string;
  readonly title?: string;
  readonly children: readonly BDUIElement[];
  readonly onEnter?: readonly Action[];
  readonly onExit?: readonly Action[];
  readonly onResume?: readonly Action[];
  readonly transitions?: readonly FlowTransition[];
}

/** Route that represents a multi-step flow. */
export interface FlowRouteScreen {
  readonly id: string;
  readonly type: 'flow';
  readonly title?: string;
  readonly startStep: string;
  readonly persistence?: FlowPersistence;
  readonly steps: readonly FlowStep[];
}

export interface FlowPersistence {
  /**
   * Persist flow state across sessions.
   * - `none` — purge on abort/complete.
   * - `session` — persist inside session scope under `__flows.<routeId>`.
   */
  readonly mode?: 'none' | 'session';
}

/**
 * Runtime snapshot describing where a user is inside a flow.
 * Stored by FlowEngine in `flow.__flows.<routeId>`.
 */
export interface FlowStateHandle {
  readonly routeId: string;
  readonly currentStepId: string;
  readonly startedAt: string;
  readonly updatedAt: string;
  readonly history: readonly string[];
  readonly status: 'running' | 'completed' | 'aborted';
  readonly abortReason?: string;
}

export function isFlowStateHandle(value: unknown): value is FlowStateHandle {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<FlowStateHandle>;
  return (
    typeof v.routeId === 'string' &&
    typeof v.currentStepId === 'string' &&
    typeof v.startedAt === 'string' &&
    Array.isArray(v.history)
  );
}
