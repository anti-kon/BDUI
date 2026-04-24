import type { Contract } from '@bdui/core';
import { describe, expect, it, vi } from 'vitest';

import {
  createActionRunner,
  createFlowController,
  createModalController,
  createNavigationController,
  createRuntimeStateController,
  createToastController,
  type HttpClient,
  MemoryStorageAdapter,
  type StateValidator,
} from '../index.js';

function setupRunner(
  options: {
    contractPatch?: Partial<Contract>;
    http?: HttpClient;
    validators?: Readonly<Record<string, StateValidator>>;
  } = {},
) {
  const contract: Contract = {
    meta: {
      contractId: 'test',
      version: '1.0.0',
      schemaVersion: '1.0.0',
      generatedAt: '2026-01-01T00:00:00Z',
    },
    navigation: {
      initialRoute: 'home',
      routes: [
        { id: 'home', node: { type: 'Column', children: [] } } as unknown as never,
        { id: 'other', node: { type: 'Column', children: [] } } as unknown as never,
      ],
    },
    initial: { flow: { counter: 0 } },
    ...options.contractPatch,
  };
  const state = createRuntimeStateController({
    contract,
    storage: new MemoryStorageAdapter(),
  });
  const navigation = createNavigationController(contract.navigation);
  const toast = createToastController();
  const modal = createModalController();
  const flow = createFlowController(state);
  const runner = createActionRunner({
    contract,
    state,
    navigation,
    flow,
    toast,
    modal,
    http: options.http,
    validators: options.validators,
  });
  return { runner, state, navigation, toast, modal };
}

describe('ActionRunner', () => {
  it('increments state via update.inc', async () => {
    const { runner, state } = setupRunner();
    await runner.run({
      type: 'update.inc',
      params: { target: { scope: 'flow', path: 'counter' }, by: 3 },
    });
    expect(state.read('flow', 'counter')).toBe(3);
  });

  it('toggles booleans via update.toggle', async () => {
    const { runner, state } = setupRunner();
    state.write('flow', 'flag', false);
    await runner.run({
      type: 'update.toggle',
      params: { target: { scope: 'flow', path: 'flag' } },
    });
    expect(state.read('flow', 'flag')).toBe(true);
  });

  it('appends to arrays via update.append', async () => {
    const { runner, state } = setupRunner();
    state.write('flow', 'items', []);
    await runner.run({
      type: 'update.append',
      params: { target: { scope: 'flow', path: 'items' }, value: 'a' },
    });
    expect(state.read('flow', 'items')).toEqual(['a']);
  });

  it('merges objects via update.merge', async () => {
    const { runner, state } = setupRunner();
    state.write('flow', 'obj', { a: 1 });
    await runner.run({
      type: 'update.merge',
      params: { target: { scope: 'flow', path: 'obj' }, value: { b: 2 } },
    });
    expect(state.read('flow', 'obj')).toEqual({ a: 1, b: 2 });
  });

  it('navigates via navigate action', async () => {
    const { runner, navigation } = setupRunner();
    await runner.run({ type: 'navigate', params: { to: 'other' } });
    expect(navigation.currentRoute).toBe('other');
  });

  it('executes conditional branches via when', async () => {
    const { runner, state } = setupRunner();
    state.write('flow', 'counter', 5);
    await runner.run({
      type: 'when',
      params: {
        if: { __bduiExpr: true, code: 'flow.counter > 3' },
        then: [
          {
            type: 'set',
            params: { target: { scope: 'flow', path: 'hit' }, value: true },
          },
        ],
      },
    });
    expect(state.read('flow', 'hit')).toBe(true);
  });

  it('rolls back atomic batches on failure', async () => {
    const { runner, state } = setupRunner();
    state.write('flow', 'counter', 0);
    const errors: unknown[] = [];
    runner.on('error', (e) => errors.push(e));
    await runner.run({
      type: 'batch',
      params: {
        atomic: true,
        actions: [
          { type: 'update.inc', params: { target: { scope: 'flow', path: 'counter' } } },
          { type: 'navigate', params: { to: 'nonexistent' } },
          { type: 'update.inc', params: { target: { scope: 'flow', path: 'counter' } } },
        ],
      },
    });
    expect(state.read('flow', 'counter')).toBe(2);
  });

  it('fetches static data sources into local state by default', async () => {
    const { runner, state } = setupRunner({
      contractPatch: {
        dataSources: [{ id: 'profile', kind: 'static', value: { name: '{{flow.name}}' } }],
        initial: { flow: { counter: 0, name: 'Ada' } },
      },
    });

    await runner.run({ type: 'fetch', params: { sourceId: 'profile' } });

    expect(state.read('local', 'dataSources.profile')).toEqual({ name: 'Ada' });
  });

  it('fetches HTTP data sources and saves to an explicit target', async () => {
    const http = vi.fn<HttpClient>().mockResolvedValue({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { ok: true },
    });
    const { runner, state } = setupRunner({
      http,
      contractPatch: {
        dataSources: [
          {
            id: 'user',
            kind: 'rest',
            url: '/api/users/{{params.id}}',
            method: 'POST',
            body: { filter: '{{params.filter}}' },
          },
        ],
      },
    });

    await runner.run({
      type: 'fetch',
      params: {
        sourceId: 'user',
        params: { id: '42', filter: 'active' },
        saveTo: { scope: 'flow', path: 'user' },
      },
    });

    expect(http).toHaveBeenCalledWith({
      url: '/api/users/42',
      method: 'POST',
      headers: undefined,
      body: { filter: 'active' },
    });
    expect(state.read('flow', 'user')).toEqual({ ok: true });
  });

  it('records successful validation results', async () => {
    const { runner, state } = setupRunner({
      validators: {
        nonEmpty: (value) => typeof value === 'string' && value.length > 0,
      },
    });
    state.write('flow', 'name', 'Ada');

    await runner.run({
      type: 'validate',
      params: { schemaRef: 'nonEmpty', target: { scope: 'flow', path: 'name' } },
    });

    expect(state.read('local', '__validation')).toEqual({
      nonEmpty: {
        ok: true,
        errors: [],
        target: { scope: 'flow', path: 'name' },
      },
    });
  });

  it('emits validation errors and records failed validation results', async () => {
    const errors: unknown[] = [];
    const { runner, state } = setupRunner({
      validators: {
        nonEmpty: () => 'Required',
      },
    });
    runner.on('error', (event) => errors.push(event));

    await runner.run({
      type: 'validate',
      params: { schemaRef: 'nonEmpty', target: { scope: 'flow', path: 'name' } },
    });

    expect(state.read('local', '__validation')).toEqual({
      nonEmpty: {
        ok: false,
        errors: ['Required'],
        target: { scope: 'flow', path: 'name' },
      },
    });
    expect(errors).toHaveLength(1);
  });
});
