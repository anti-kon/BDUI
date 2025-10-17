export * from './expr';
export * from './generated/components';
export * from './state';
export * from './theme';
export * from './types';

import { __collectInitial } from './state';
import type { Contract as ContractType, Meta, Navigation as NavigationType } from './types';

type RouteProps = {
  id: string;
  title?: string;
  path?: string;
  cache?: Record<string, unknown>;
  children: any;
};
export function Route({ id, title, path, cache, children }: RouteProps) {
  const node = Array.isArray(children) ? { type: 'Column', children } : children;
  return { __kind: 'Route', value: { id, title, path, cache, node } } as const;
}

type NavigationProps = { initialRoute: string; urlSync?: boolean; children?: any };
export function Navigation({ initialRoute, urlSync, children }: NavigationProps) {
  const flat = Array.isArray(children) ? children.flat() : [children];
  const routes = flat.filter((c: any) => c && c.__kind === 'Route').map((c: any) => c.value);
  const nav: NavigationType = { initialRoute, urlSync, routes };
  return { __kind: 'Navigation', value: nav } as const;
}

type ContractProps = { meta: Meta; children?: any };
export function Contract({ meta, children }: ContractProps): ContractType {
  const now = new Date().toISOString();
  const normMeta = { ...meta, generatedAt: meta.generatedAt ?? now };
  const flat = Array.isArray(children) ? children.flat() : [children];

  const themeNode = flat.find((c: any) => c && c.__kind === 'Theme');
  const navNode = flat.find((c: any) => c && c.__kind === 'Navigation');
  if (!navNode) throw new Error('Contract: Navigation child is required');

  const contract: ContractType = {
    meta: normMeta,
    theme: themeNode ? themeNode.value : undefined,
    navigation: navNode.value,
    initial: __collectInitial(),
  };
  return contract;
}
