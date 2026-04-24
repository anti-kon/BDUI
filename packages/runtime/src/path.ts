/** Deep immutable get by dot-path. */
export function deepGet(obj: unknown, path: string): unknown {
  if (!path) return obj;
  if (obj === null || typeof obj !== 'object') return undefined;
  const parts = path.split('.').filter(Boolean);
  let current: unknown = obj;
  for (const key of parts) {
    if (current === null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

/**
 * Deep immutable set by dot-path. Returns a new root; leaves the rest of the
 * tree structurally shared with the input.
 */
export function deepSet<T extends Record<string, unknown>>(
  obj: T,
  path: string,
  value: unknown,
): T {
  const parts = path.split('.').filter(Boolean);
  if (parts.length === 0) return obj;
  return assoc(obj, parts, 0, value) as T;
}

function assoc(node: unknown, parts: readonly string[], index: number, value: unknown): unknown {
  const key = parts[index];
  if (key === undefined) return value;
  const base =
    node !== null && typeof node === 'object' && !Array.isArray(node)
      ? { ...(node as Record<string, unknown>) }
      : {};
  base[key] = assoc(base[key], parts, index + 1, value);
  return base;
}

/** Delete a dot-path (returns a new root). */
export function deepDelete<T extends Record<string, unknown>>(obj: T, path: string): T {
  const parts = path.split('.').filter(Boolean);
  if (parts.length === 0) return obj;
  return dissoc(obj, parts, 0) as T;
}

function dissoc(node: unknown, parts: readonly string[], index: number): unknown {
  if (node === null || typeof node !== 'object') return node;
  const key = parts[index];
  if (key === undefined) return node;
  const clone = { ...(node as Record<string, unknown>) };
  if (index === parts.length - 1) {
    delete clone[key];
    return clone;
  }
  clone[key] = dissoc(clone[key], parts, index + 1);
  return clone;
}
