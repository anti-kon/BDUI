/** Deep immutable get by dot-path. */
export declare function deepGet(obj: unknown, path: string): unknown;
/**
 * Deep immutable set by dot-path. Returns a new root; leaves the rest of the
 * tree structurally shared with the input.
 */
export declare function deepSet<T extends Record<string, unknown>>(obj: T, path: string, value: unknown): T;
/** Delete a dot-path (returns a new root). */
export declare function deepDelete<T extends Record<string, unknown>>(obj: T, path: string): T;
//# sourceMappingURL=path.d.ts.map