import { normalizeActions } from '../actions-normalize.js';
import { toJsonValue } from '../expr.js';
export function createNode(type, props, cfg) {
  const { children, onAction, ...rest } = props ?? {};
  const cleaned = {};
  if (cfg.aliases) {
    for (const key in cfg.aliases) {
      if (Object.prototype.hasOwnProperty.call(rest, key) && rest[key] !== undefined) {
        const real = cfg.aliases[key];
        rest[real] = rest[key];
        delete rest[key];
      }
    }
  }
  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined) continue;
    cleaned[key] = toJsonValue(value);
  }
  if (onAction !== undefined) {
    cleaned.onAction = normalizeActions(onAction);
  }
  if (cfg.children === 'text') {
    if (children !== undefined) {
      const toText = (c) => {
        const value = toJsonValue(c);
        return value == null ? '' : String(value);
      };
      const textValue = Array.isArray(children)
        ? children.flat().map(toText).join('')
        : toText(children);
      cleaned[cfg.mapToProp || 'text'] = textValue;
    }
    return { type, ...cleaned };
  }
  const node = { type, ...cleaned };
  if (cfg.children === 'nodes' && children !== undefined) {
    node.children = Array.isArray(children) ? children.flat() : [children];
  }
  return node;
}
