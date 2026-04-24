import type { Action, BDUIElement, Binding } from '@bdui/core';

import { normalizeActions, type ShortAction } from '../actions-normalize.js';
import { toJsonValue } from '../expr.js';
import { isStateVar } from '../state.js';

export type ChildMode = 'none' | 'text' | 'nodes' | 'slots';

export interface NodeCfg {
  readonly children: ChildMode;
  readonly mapToProp?: string;
  readonly aliases?: Readonly<Record<string, string>>;
  readonly events?: readonly string[];
}

/** Serialise a prop value: handle StateVar → Binding, ExprRef → {{...}}, etc. */
function normalisePropValue(value: unknown): unknown {
  if (isStateVar(value)) {
    return { scope: value.scope, path: value.path } satisfies Binding;
  }
  if (Array.isArray(value)) {
    return value.map(normalisePropValue);
  }
  if (value && typeof value === 'object' && !(value as { __bduiExpr?: unknown }).__bduiExpr) {
    const record = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(record)) {
      if (v === undefined) continue;
      out[k] = normalisePropValue(v);
    }
    return out;
  }
  return toJsonValue(value);
}

export function createNode(
  type: string,
  props: Record<string, unknown> | null,
  cfg: NodeCfg,
): BDUIElement {
  const src = props ?? {};
  const { children, ...rest } = src as { children?: unknown } & Record<string, unknown>;
  const remapped: Record<string, unknown> = {};

  for (const [rawKey, rawValue] of Object.entries(rest)) {
    const actualKey = cfg.aliases?.[rawKey] ?? rawKey;
    if (rawValue === undefined) continue;
    if (cfg.events && (cfg.events as readonly string[]).includes(actualKey)) {
      remapped[actualKey] = normalizeActions(
        rawValue as ShortAction | Action | readonly (ShortAction | Action)[],
      );
    } else {
      remapped[actualKey] = normalisePropValue(rawValue);
    }
  }

  if (cfg.children === 'text') {
    if (children !== undefined) {
      const toText = (c: unknown): string => {
        const value = toJsonValue(c);
        return value == null ? '' : String(value);
      };
      const textValue = Array.isArray(children)
        ? (children.flat() as unknown[]).map(toText).join('')
        : toText(children);
      remapped[cfg.mapToProp ?? 'text'] = textValue;
    }
    return { type, ...remapped } as unknown as BDUIElement;
  }

  const node: Record<string, unknown> = { type, ...remapped };
  if ((cfg.children === 'nodes' || cfg.children === 'slots') && children !== undefined) {
    const list = Array.isArray(children) ? (children.flat() as unknown[]) : [children];
    node.children = list.filter((v): v is BDUIElement => v != null && v !== false);
  }
  return node as unknown as BDUIElement;
}
