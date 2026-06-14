import type { Contract } from '@bdui/core';
import { Window } from 'happy-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { mount } from '../mount.js';

function createDom(): { window: Window; container: HTMLElement } {
  const window = new Window();
  const container = window.document.createElement('div');
  window.document.body.appendChild(container);
  return { window, container: container as unknown as HTMLElement };
}

function simpleContract(): Contract {
  return {
    meta: {
      contractId: 'demo',
      version: '1.0.0',
      schemaVersion: '1.0.0',
      generatedAt: '2026-01-01T00:00:00Z',
    },
    navigation: {
      initialRoute: 'home',
      routes: [
        {
          id: 'home',
          node: {
            type: 'Column',
            children: [
              {
                type: 'Text',
                text: 'Hello',
                children: [],
              },
              {
                type: 'Button',
                title: 'Increment',
                onAction: [
                  {
                    type: 'update.inc',
                    params: { target: { scope: 'flow', path: 'counter' } },
                  },
                ],
                children: [],
              },
              {
                type: 'Text',
                text: 'count={{flow.counter}}',
                children: [],
              },
            ],
          },
        } as unknown as never,
      ],
    },
    initial: { flow: { counter: 0 } },
  };
}

function flowContract(): Contract {
  return {
    meta: {
      contractId: 'flow-demo',
      version: '1.0.0',
      schemaVersion: '1.0.0',
      generatedAt: '2026-01-01T00:00:00Z',
    },
    navigation: {
      initialRoute: 'wizard',
      routes: [
        {
          id: 'wizard',
          type: 'flow',
          title: 'Wizard',
          startStep: 'start',
          steps: [
            {
              id: 'start',
              title: 'Start',
              children: [
                {
                  type: 'Column',
                  children: [
                    { type: 'Text', text: 'Only once' },
                    { type: 'Button', title: 'Continue' },
                  ],
                },
              ],
            },
          ],
        } as unknown as never,
      ],
    },
  };
}

function modalContract(): Contract {
  return {
    meta: {
      contractId: 'modal-demo',
      version: '1.0.0',
      schemaVersion: '1.0.0',
      generatedAt: '2026-01-01T00:00:00Z',
    },
    navigation: {
      initialRoute: 'home',
      routes: [
        {
          id: 'home',
          node: {
            type: 'Column',
            children: [
              {
                type: 'Button',
                title: 'Open modal',
                onAction: [{ type: 'modal.open', params: { id: 'help-modal' } }],
              },
              {
                type: 'If',
                condition: false,
                children: [
                  {
                    id: 'help-modal',
                    type: 'Column',
                    children: [
                      { type: 'Text', text: 'Modal body' },
                      {
                        type: 'Button',
                        title: 'Close modal',
                        onAction: [{ type: 'modal.close', params: { id: 'help-modal' } }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        } as unknown as never,
      ],
    },
  };
}

function selectContract(): Contract {
  return {
    meta: {
      contractId: 'select-demo',
      version: '1.0.0',
      schemaVersion: '1.0.0',
      generatedAt: '2026-01-01T00:00:00Z',
    },
    navigation: {
      initialRoute: 'home',
      routes: [
        {
          id: 'home',
          node: {
            type: 'Column',
            children: [
              {
                type: 'Select',
                binding: { scope: 'flow', path: 'plan' },
                options: [
                  { value: 'starter', label: 'Starter' },
                  { value: 'scale', label: 'Scale' },
                  { value: 'enterprise', label: 'Enterprise' },
                ],
              },
              {
                type: 'Text',
                text: 'plan={{flow.plan}}',
              },
            ],
          },
        } as unknown as never,
      ],
    },
    initial: { flow: { plan: 'scale' } },
  };
}

describe('mount (renderer-web integration)', () => {
  let dom: ReturnType<typeof createDom>;

  beforeEach(() => {
    dom = createDom();
  });

  it('renders initial screen with text, buttons and interpolations', async () => {
    const app = mount(dom.container, simpleContract(), {
      storage: undefined,
    });
    expect(dom.container.textContent).toContain('Hello');
    expect(dom.container.textContent).toContain('Increment');
    expect(dom.container.textContent).toContain('count=0');
    app.dispose();
  });

  it('re-renders when state changes', async () => {
    const app = mount(dom.container, simpleContract());
    app.runtime.state.write('flow', 'counter', 5);
    await Promise.resolve();
    expect(dom.container.textContent).toContain('count=5');
    app.dispose();
  });

  it('reacts to click events and runs inc action', async () => {
    const app = mount(dom.container, simpleContract());
    const button = dom.container.querySelector('button');
    expect(button).not.toBeNull();
    (button as unknown as { click: () => void }).click();
    await Promise.resolve();
    expect(app.runtime.state.read('flow', 'counter')).toBe(1);
    expect(dom.container.textContent).toContain('count=1');
    app.dispose();
  });

  it('does not duplicate the first flow step while initializing flow state', async () => {
    const app = mount(dom.container, flowContract());
    await Promise.resolve();
    const buttons = [...dom.container.querySelectorAll('button')].filter(
      (button) => button.textContent === 'Continue',
    );
    expect(buttons).toHaveLength(1);
    expect(dom.container.textContent?.match(/Only once/g)).toHaveLength(1);
    app.dispose();
  });

  it('opens and closes modal descriptors by node id', async () => {
    const app = mount(dom.container, modalContract());
    (dom.container.querySelector('button') as unknown as { click: () => void }).click();
    await Promise.resolve();

    const modal = dom.window.document.body.querySelector('.bdui-modal');
    expect(modal?.textContent).toContain('Modal body');

    (modal?.querySelector('button') as unknown as { click: () => void }).click();
    await Promise.resolve();
    expect(dom.window.document.body.querySelector('.bdui-modal')).toBeNull();
    app.dispose();
  });

  it('keeps select value in sync with bound runtime state', async () => {
    const app = mount(dom.container, selectContract());
    const select = dom.container.querySelector('select') as HTMLSelectElement | null;
    expect(select).not.toBeNull();
    expect(select?.value).toBe('scale');

    select!.value = 'enterprise';
    select!.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    await Promise.resolve();

    const nextSelect = dom.container.querySelector('select') as HTMLSelectElement | null;
    expect(app.runtime.state.read('flow', 'plan')).toBe('enterprise');
    expect(nextSelect?.value).toBe('enterprise');
    expect(dom.container.textContent).toContain('plan=enterprise');
    app.dispose();
  });

  it('tears down listeners on dispose', () => {
    const app = mount(dom.container, simpleContract());
    app.dispose();
    expect(dom.container.childNodes.length).toBe(0);
  });
});
