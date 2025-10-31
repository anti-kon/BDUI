import type { AppRoute, FlowRouteScreen } from '@bdui/common';
import type { ComponentNode } from '@bdui/defs';

export type CssModifiers = Record<string, unknown> | undefined;

export function cssForModifiers(modifiers: CssModifiers): Record<string, string> {
  if (!modifiers) return {};
  const style: Record<string, string> = {};
  const entries = Object.entries(modifiers);
  for (const [key, value] of entries) {
    if (value == null) continue;
    switch (key) {
      case 'padding':
      case 'gap':
      case 'width':
      case 'height':
        style[key] = typeof value === 'number' ? `${value}px` : String(value);
        break;
      case 'align':
        style.alignItems = String(value);
        break;
      case 'justify':
        style.justifyContent = String(value);
        break;
      default:
        style[key] = String(value);
    }
  }
  return style;
}

export function formatValue(value: unknown): string {
  return value == null ? '' : String(value);
}

export function renderUnsupportedNode(doc: Document, node: ComponentNode): HTMLElement {
  const el = doc.createElement('pre');
  el.textContent = '[Unsupported node] ' + JSON.stringify(node, null, 2);
  return el;
}

export function isFlowRoute(route: AppRoute): route is FlowRouteScreen {
  return (route as FlowRouteScreen).type === 'flow';
}
