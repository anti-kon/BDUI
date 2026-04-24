import type { Navigation } from '@bdui/core';
import { describe, expect, it } from 'vitest';

import { createNavigationController } from '../navigation.js';

function nav(): Navigation {
  return {
    initialRoute: 'home',
    routes: [
      { id: 'home', node: { type: 'Column', children: [] } } as unknown as never,
      { id: 'about', node: { type: 'Column', children: [] } } as unknown as never,
      { id: 'settings', node: { type: 'Column', children: [] } } as unknown as never,
    ],
  };
}

describe('NavigationController', () => {
  it('navigates forward and back', () => {
    const ctl = createNavigationController(nav());
    expect(ctl.currentRoute).toBe('home');
    expect(ctl.navigate('about')).toBe(true);
    expect(ctl.currentRoute).toBe('about');
    expect(ctl.back()).toBe(true);
    expect(ctl.currentRoute).toBe('home');
  });

  it('replaces without pushing history', () => {
    const ctl = createNavigationController(nav());
    ctl.navigate('about');
    ctl.replace('settings');
    ctl.back();
    expect(ctl.currentRoute).toBe('home');
  });

  it('rejects unknown route ids', () => {
    const ctl = createNavigationController(nav());
    expect(ctl.navigate('missing')).toBe(false);
    expect(ctl.currentRoute).toBe('home');
  });

  it('emits change events', () => {
    const ctl = createNavigationController(nav());
    const events: unknown[] = [];
    ctl.on('change', (e) => events.push(e));
    ctl.navigate('about');
    ctl.replace('settings');
    expect(events).toHaveLength(2);
  });

  it('popToRoot returns to initial route', () => {
    const ctl = createNavigationController(nav());
    ctl.navigate('about');
    ctl.navigate('settings');
    expect(ctl.popToRoot()).toBe(true);
    expect(ctl.currentRoute).toBe('home');
  });
});
