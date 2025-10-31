import type { BDUIElement } from '../types.js';
export type ChildMode = 'none' | 'text' | 'nodes';
export type NodeCfg = {
  children: ChildMode;
  mapToProp?: string;
  aliases?: Record<string, string>;
};
export declare function createNode<T extends BDUIElement['type']>(
  type: T,
  props: any,
  cfg: NodeCfg,
): any;
