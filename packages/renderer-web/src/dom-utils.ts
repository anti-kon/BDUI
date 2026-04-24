import type { BDUIElement } from '@bdui/core';

export function cssForModifiers(
  modifiers: Readonly<Record<string, unknown>> | undefined,
): Record<string, string> {
  if (!modifiers) return {};
  const style: Record<string, string> = {};
  for (const [key, value] of Object.entries(modifiers)) {
    if (value == null) continue;
    switch (key) {
      case 'padding':
      case 'gap':
      case 'width':
      case 'height':
      case 'margin':
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

export function renderUnsupported(doc: Document, node: BDUIElement): HTMLElement {
  const el = doc.createElement('pre');
  el.textContent = '[Unsupported node]\n' + JSON.stringify(node, null, 2);
  el.style.color = '#991b1b';
  el.style.background = '#fef2f2';
  el.style.padding = '8px';
  el.style.borderRadius = '4px';
  return el;
}

export function formatValue(value: unknown): string {
  return value == null ? '' : String(value);
}
