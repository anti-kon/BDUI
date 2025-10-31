import type { WebRendererContext } from '../registry/types.js';

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
