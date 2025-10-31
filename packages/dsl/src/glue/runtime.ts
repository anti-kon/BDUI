import { normalizeActions } from '../actions-normalize.js';
import { toJsonValue } from '../expr.js';
import type { BDUIElement } from '../types.js';

export type ChildMode = 'none' | 'text' | 'nodes';
export type NodeCfg = { children: ChildMode; mapToProp?: string; aliases?: Record<string, string> };

export function createNode<T extends BDUIElement['type']>(type: T, props: any, cfg: NodeCfg): any {
  const { children, onAction, ...rest } = props ?? {};
  const cleaned: Record<string, any> = {};

  if (cfg.aliases) {
    for (const key in cfg.aliases) {
      if (Object.prototype.hasOwnProperty.call(rest, key) && rest[key] !== undefined) {
        const real = cfg.aliases[key]!;
        rest[real] = rest[key];
        delete rest[key];
      }
    }
  }

  for (const [key, value] of Object.entries(rest as Record<string, any>)) {
    if (value === undefined) continue;
    cleaned[key] = toJsonValue(value);
  }

  if (onAction !== undefined) {
    (cleaned as any).onAction = normalizeActions(onAction);
  }

  if (cfg.children === 'text') {
    if (children !== undefined) {
      const toText = (c: any): string => {
        const value = toJsonValue(c);
        return value == null ? '' : String(value);
      };
      const textValue = Array.isArray(children)
        ? children.flat().map(toText).join('')
        : toText(children);

      cleaned[cfg.mapToProp || 'text'] = textValue;
    }
    return { type, ...cleaned } as any;
  }

  const node: any = { type, ...cleaned };
  if (cfg.children === 'nodes' && children !== undefined) {
    node.children = Array.isArray(children) ? children.flat() : [children];
  }
  return node as any;
}
