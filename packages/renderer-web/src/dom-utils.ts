import type { BDUIElement } from '@bdui/core';

const LENGTH_PROPS = new Set([
  'borderRadius',
  'bottom',
  'columnGap',
  'fontSize',
  'gap',
  'height',
  'left',
  'letterSpacing',
  'margin',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginTop',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'padding',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'right',
  'rowGap',
  'top',
  'width',
]);

const NON_CSS_MODIFIERS = new Set(['accessibilityLabel', 'role', 'testId', 'variant']);

function cssValue(key: string, value: unknown): string | undefined {
  if (value == null) return undefined;
  if (key === 'lineHeight' && typeof value === 'number') return String(value);
  if (typeof value === 'number' && LENGTH_PROPS.has(key)) return `${value}px`;
  return String(value);
}

function flexPosition(value: unknown): string {
  switch (value) {
    case 'start':
      return 'flex-start';
    case 'end':
      return 'flex-end';
    case 'between':
      return 'space-between';
    case 'around':
      return 'space-around';
    default:
      return String(value);
  }
}

export function cssForModifiers(
  modifiers: Readonly<Record<string, unknown>> | undefined,
): Record<string, string> {
  if (!modifiers) return {};
  const style: Record<string, string> = {};
  for (const [key, value] of Object.entries(modifiers)) {
    if (value == null) continue;
    if (key === 'style' && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(style, cssForModifiers(value as Readonly<Record<string, unknown>>));
      continue;
    }
    if (NON_CSS_MODIFIERS.has(key)) continue;
    switch (key) {
      case 'align':
        style.alignItems = flexPosition(value);
        break;
      case 'justify':
        style.justifyContent = flexPosition(value);
        break;
      default: {
        const nextValue = cssValue(key, value);
        if (nextValue !== undefined) style[key] = nextValue;
      }
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
