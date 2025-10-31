let currentContext = null;
export function withWebContext(context, render) {
  const prev = currentContext;
  currentContext = context;
  try {
    return render();
  } finally {
    currentContext = prev;
  }
}
export function getWebContext() {
  if (!currentContext) {
    throw new Error('web JSX runtime: контекст не установлен. Используйте withWebContext().');
  }
  return currentContext;
}
