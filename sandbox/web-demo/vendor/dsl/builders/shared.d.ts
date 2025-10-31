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
export type DslNode<K extends string, V> = {
  readonly __kind: K;
  readonly value: V;
};
export type AnyDslNode = DslNode<string, unknown>;
export type Maybe<T> = T | null | undefined | false;
export declare function isPresent<T>(value: Maybe<T>): value is T;
export declare function normalizeList<T>(input: Maybe<T | T[]>): T[];
export declare function optionalList<T>(input: Maybe<T | T[]>): T[] | undefined;
export declare function ensureComponentNode(children: BDUIElement[]): BDUIElement;
export declare function createNode<K extends string, V>(kind: K, value: V): DslNode<K, V>;
export declare function pickNode<K extends string, V>(
  nodes: AnyDslNode[],
  kind: K,
): DslNode<K, V> | undefined;
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
