import type {
  Action,
  AppRoute,
  BDUIElement,
  Contract,
  FlowRouteScreen,
  FlowStep,
  FlowTransition,
  Meta,
  Navigation as NavigationType,
  RouteScreen,
  Theme,
} from '@bdui/core';

export type DslNode<K extends string, V> = { readonly __kind: K; readonly value: V };
export type AnyDslNode = DslNode<string, unknown>;

export type Maybe<T> = T | null | undefined | false;

export function isPresent<T>(value: Maybe<T>): value is T {
  return value !== null && value !== undefined && value !== false;
}

export function normalizeList<T>(input: Maybe<T | readonly T[]>): T[] {
  if (!isPresent(input)) return [];
  const raw = Array.isArray(input) ? (input as readonly T[]).flat(Infinity) : [input as T];
  return (raw as T[]).filter(isPresent);
}

export function optionalList<T>(input: Maybe<T | readonly T[]>): T[] | undefined {
  return isPresent(input) ? normalizeList<T>(input) : undefined;
}

export function ensureComponentNode(children: readonly BDUIElement[]): BDUIElement {
  if (children.length === 0) {
    return { type: 'Column', children: [] };
  }
  if (children.length === 1) {
    return children[0] as BDUIElement;
  }
  return { type: 'Column', children };
}

export function createNode<K extends string, V>(kind: K, value: V): DslNode<K, V> {
  return { __kind: kind, value } as const;
}

export function pickNode<K extends string, V>(
  nodes: readonly AnyDslNode[],
  kind: K,
): DslNode<K, V> | undefined {
  return nodes.find((node): node is DslNode<K, V> => node?.__kind === kind);
}

export type {
  Action,
  AppRoute,
  BDUIElement,
  Contract,
  FlowRouteScreen,
  FlowStep,
  FlowTransition,
  Meta,
  NavigationType,
  RouteScreen,
  Theme,
};
