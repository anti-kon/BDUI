export const E = (code) => ({ __bduiExpr: true, code });
export function toJsonValue(v) {
  if (v && typeof v === 'object' && v.__bduiExpr) return `{{${v.code}}}`;
  return v;
}
