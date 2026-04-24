import { describe, expect, it } from 'vitest';

import { assertValidContract, validateContract } from '../index.js';

function baseMeta() {
  return {
    contractId: 'com.example.demo',
    version: '1.0.0',
    schemaVersion: '1.0.0',
    generatedAt: '2026-01-01T00:00:00Z',
  };
}

describe('validateContract', () => {
  it('accepts a minimal valid contract', () => {
    const contract = {
      meta: baseMeta(),
      navigation: {
        initialRoute: 'home',
        routes: [
          {
            id: 'home',
            node: {
              type: 'Column',
              children: [{ type: 'Text', text: 'Hello' }],
            },
          },
        ],
      },
    };
    const result = validateContract(contract);
    expect(result.ok, JSON.stringify(result.errors, null, 2)).toBe(true);
  });

  it('rejects unknown node type', () => {
    const contract = {
      meta: baseMeta(),
      navigation: {
        initialRoute: 'home',
        routes: [
          {
            id: 'home',
            node: { type: 'BogusComponent' },
          },
        ],
      },
    };
    const result = validateContract(contract);
    expect(result.ok).toBe(false);
  });

  it('rejects nodes with additional properties', () => {
    const contract = {
      meta: baseMeta(),
      navigation: {
        initialRoute: 'home',
        routes: [
          {
            id: 'home',
            node: {
              type: 'Text',
              text: 'hi',
              unknownExtraProp: 42,
            },
          },
        ],
      },
    };
    const result = validateContract(contract);
    expect(result.ok).toBe(false);
  });

  it('accepts events as ActionList', () => {
    const contract = {
      meta: baseMeta(),
      navigation: {
        initialRoute: 'home',
        routes: [
          {
            id: 'home',
            node: {
              type: 'Button',
              title: 'Go',
              onAction: [{ type: 'navigate', params: { to: 'other' } }],
            },
          },
        ],
      },
    };
    const result = validateContract(contract);
    expect(result.ok, JSON.stringify(result.errors, null, 2)).toBe(true);
  });

  it('rejects malformed action in event', () => {
    const contract = {
      meta: baseMeta(),
      navigation: {
        initialRoute: 'home',
        routes: [
          {
            id: 'home',
            node: {
              type: 'Button',
              title: 'Go',
              onAction: [{ type: 'navigate' }],
            },
          },
        ],
      },
    };
    const result = validateContract(contract);
    expect(result.ok).toBe(false);
  });

  it('accepts ExprRef pattern string', () => {
    const contract = {
      meta: baseMeta(),
      navigation: {
        initialRoute: 'home',
        routes: [
          {
            id: 'home',
            node: {
              type: 'Text',
              text: '{{session.userName}}',
            },
          },
        ],
      },
    };
    const result = validateContract(contract);
    expect(result.ok, JSON.stringify(result.errors, null, 2)).toBe(true);
  });

  it('validates flow route with steps', () => {
    const contract = {
      meta: baseMeta(),
      navigation: {
        initialRoute: 'wizard',
        routes: [
          {
            id: 'wizard',
            type: 'flow',
            startStep: 'intro',
            steps: [
              {
                id: 'intro',
                children: [{ type: 'Text', text: 'Welcome' }],
                onEnter: [
                  {
                    type: 'set',
                    params: { target: { scope: 'flow', path: 'started' }, value: true },
                  },
                ],
                transitions: [{ guard: '{{flow.started}}', to: 'next' }],
              },
              {
                id: 'next',
                children: [{ type: 'Text', text: 'Done' }],
              },
            ],
          },
        ],
      },
    };
    const result = validateContract(contract);
    expect(result.ok, JSON.stringify(result.errors, null, 2)).toBe(true);
  });

  it('assertValidContract throws on invalid data', () => {
    expect(() => assertValidContract({} as unknown)).toThrow();
  });
});
