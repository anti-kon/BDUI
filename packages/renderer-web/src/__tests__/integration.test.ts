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

  it('tears down listeners on dispose', () => {
    const app = mount(dom.container, simpleContract());
    app.dispose();
    expect(dom.container.childNodes.length).toBe(0);
  });
});
