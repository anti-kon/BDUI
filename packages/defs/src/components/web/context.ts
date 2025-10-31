import type { WebRendererContext } from '../types.js';

let currentContext: WebRendererContext | null = null;

export function withWebContext<T>(context: WebRendererContext, render: () => T): T {
  const prev = currentContext;
  currentContext = context;
  try {
    return render();
  } finally {
    currentContext = prev;
  }
}

export function getWebContext(): WebRendererContext {
  if (!currentContext) {
    throw new Error('web JSX runtime: контекст не установлен. Используйте withWebContext().');
  }
  return currentContext;
}

export type StyleValue = string | number;
export type StyleRecord = Record<string, StyleValue>;

export function composeStyles(
  ...styles: Array<StyleRecord | null | undefined | false>
): Record<string, StyleValue> {
  const result: Record<string, StyleValue> = {};
  for (const style of styles) {
    if (!style) continue;
    Object.assign(result, style);
  }
  return result;
}
