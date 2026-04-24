import type { WebRendererContext } from '../registry/types.js';

export type StyleRecord = Record<string, string | number | undefined>;

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
    throw new Error(
      'web JSX runtime: rendering context is not set. Use withWebContext() in your renderer body.',
    );
  }
  return currentContext;
}
