import type {
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
} from '../types.js';

export type DslNode<K extends string, V> = { readonly __kind: K; readonly value: V };
export type AnyDslNode = DslNode<string, unknown>;

export type Maybe<T> = T | null | undefined | false;

export function isPresent<T>(value: Maybe<T>): value is T {
  return value !== null && value !== undefined && value !== false;
}

export function normalizeList<T>(input: Maybe<T | T[]>): T[] {
  if (!isPresent(input)) return [];
  const raw = Array.isArray(input) ? input.flat(Infinity) : [input];
  return raw.filter(isPresent) as T[];
}

export function optionalList<T>(input: Maybe<T | T[]>): T[] | undefined {
  return isPresent(input) ? normalizeList<T>(input) : undefined;
}

export function ensureComponentNode(children: BDUIElement[]): BDUIElement {
  if (children.length === 0) {
    return { type: 'Column', children: [] };
  }
  if (children.length === 1) {
    return children[0]!;
  }
  return { type: 'Column', children };
}

export function createNode<K extends string, V>(kind: K, value: V): DslNode<K, V> {
  return { __kind: kind, value } as const;
}

export function pickNode<K extends string, V>(
  nodes: AnyDslNode[],
  kind: K,
): DslNode<K, V> | undefined {
  return nodes.find((node): node is DslNode<K, V> => node?.__kind === kind);
}

export type {
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
