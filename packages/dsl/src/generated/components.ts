// AUTO-GENERATED. Do not edit.
import { normalizeActions } from '../actions-normalize';
import { toJsonValue } from '../expr';
import type { BDUIElement } from '../types';

type ChildMode = 'none' | 'text' | 'nodes';
type NodeCfg = { children: ChildMode; mapToProp?: string; aliases?: Record<string, string> };

function node<T extends BDUIElement['type']>(type: T, props: any, cfg: NodeCfg): any {
  const { children, onAction, ...rest } = props ?? {};
  const cleaned: Record<string, any> = {};

  if (cfg.aliases) {
    for (const k in cfg.aliases) {
      if (Object.prototype.hasOwnProperty.call(rest, k) && rest[k] !== undefined) {
        const real = cfg.aliases[k]!;
        rest[real] = rest[k];
        delete rest[k];
      }
    }
  }

  for (const [k, v] of Object.entries(rest as Record<string, any>)) {
    if (v === undefined) continue;
    cleaned[k] = toJsonValue(v);
  }

  if (onAction !== undefined) {
    (cleaned as any).onAction = normalizeActions(onAction);
  }

  if (cfg.children === 'text') {
    if (children !== undefined) {
      const toText = (c: any): string => {
        const v = toJsonValue(c);
        return v == null ? '' : String(v);
      };
      const textValue = Array.isArray(children)
        ? children.flat().map(toText).join('')
        : toText(children);

      cleaned[cfg.mapToProp || 'text'] = textValue;
    }
    return { type, ...cleaned } as any;
  }

  const n: any = { type, ...cleaned };
  if (cfg.children === 'nodes' && children !== undefined) {
    n.children = Array.isArray(children) ? children.flat() : [children];
  }
  return n as any;
}

export function Text(props: any): any {
  return node('Text', props, { children: 'text', mapToProp: 'text', aliases: { value: 'text' } });
}
export function Button(props: any): any {
  return node('Button', props, { children: 'none' });
}
export function Row(props: any): any {
  return node('Row', props, { children: 'nodes' });
}
export function Column(props: any): any {
  return node('Column', props, { children: 'nodes' });
}
