export function isPresent(value) {
  return value !== null && value !== undefined && value !== false;
}
export function normalizeList(input) {
  if (!isPresent(input)) return [];
  const raw = Array.isArray(input) ? input.flat(Infinity) : [input];
  return raw.filter(isPresent);
}
export function optionalList(input) {
  return isPresent(input) ? normalizeList(input) : undefined;
}
export function ensureComponentNode(children) {
  if (children.length === 0) {
    return { type: 'Column', children: [] };
  }
  if (children.length === 1) {
    return children[0];
  }
  return { type: 'Column', children };
}
export function createNode(kind, value) {
  return { __kind: kind, value };
}
export function pickNode(nodes, kind) {
  return nodes.find((node) => node?.__kind === kind);
}
