export type Expr<T = any> = { __bduiExpr: true; code: string };
export const E = (code: string): Expr => ({ __bduiExpr: true, code });

export function toJsonValue(v: any) {
  if (v && typeof v === 'object' && (v as any).__bduiExpr) return `{{${(v as any).code}}}`;
  return v;
}
