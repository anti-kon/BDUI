let currentContext = null;
export function withWebContext(context, render) {
    const prev = currentContext;
    currentContext = context;
    try {
        return render();
    }
    finally {
        currentContext = prev;
    }
}
export function getWebContext() {
    if (!currentContext) {
        throw new Error('web JSX runtime: rendering context is not set. Use withWebContext() in your renderer body.');
    }
    return currentContext;
}
//# sourceMappingURL=context.js.map