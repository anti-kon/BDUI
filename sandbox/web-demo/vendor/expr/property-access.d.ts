/**
 * Read a property from a value while blocking prototype-pollution vectors.
 * Strings and arrays expose `length` plus integer indexing; plain objects fall
 * back to a direct key lookup.
 */
export declare function safeGetProperty(obj: unknown, key: string): unknown;
//# sourceMappingURL=property-access.d.ts.map