export type Expr<T = any> = {
  __bduiExpr: true;
  code: string;
};
export declare const E: (code: string) => Expr;
export declare function toJsonValue(v: any): any;
