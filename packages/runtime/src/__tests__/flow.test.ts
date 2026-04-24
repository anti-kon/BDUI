import type { FlowRouteScreen } from '@bdui/core';
import { describe, expect, it } from 'vitest';

import { createFlowController, createRuntimeStateController, resolveFlowStep } from '../index.js';

function flow(): FlowRouteScreen {
  return {
    id: 'onboarding',
    type: 'flow',
    startStep: 'name',
    steps: [
      {
        id: 'name',
        node: { type: 'Input' } as unknown as never,
        transitions: [{ to: 'age', guard: 'flow.name != null' }],
      },
      {
        id: 'age',
        node: { type: 'Input' } as unknown as never,
        transitions: [{ to: 'done', guard: 'flow.age >= 18' }],
      },
      {
        id: 'done',
        node: { type: 'Text' } as unknown as never,
        transitions: [],
      },
    ],
  } as FlowRouteScreen;
}

describe('resolveFlowStep', () => {
  it('returns start step when state is empty', () => {
    const res = resolveFlowStep(flow(), {} as never);
    expect(res.stepId).toBe('name');
  });

  it('advances through guarded transitions when all guards pass', () => {
    const state = { flow: { name: 'A', age: 20 } } as never;
    const res = resolveFlowStep(flow(), state);
    expect(res.stepId).toBe('done');
  });

  it('stops at first failing guard', () => {
    const state = { flow: { name: 'A', age: 10 } } as never;
    const res = resolveFlowStep(flow(), state);
    expect(res.stepId).toBe('age');
  });
});

describe('FlowController', () => {
  it('tracks active flows', () => {
    const state = createRuntimeStateController({
      contract: {
        meta: {
          contractId: 't',
          version: '1.0.0',
          schemaVersion: '1.0.0',
          generatedAt: '2026-01-01T00:00:00Z',
        },
        navigation: { initialRoute: 'a', routes: [] },
      },
    });
    const ctl = createFlowController(state);
    ctl.activate('onboarding', { currentStepId: 'name' });
    expect(ctl.getActive('onboarding')?.currentStepId).toBe('name');
    ctl.deactivate('onboarding');
    expect(ctl.getActive('onboarding')).toBeUndefined();
  });
});
