import type { InitialState, Scope } from './types.js';
type Var<T> = {
  scope: Scope;
  path: string;
  name: string;
};
type FlowVar<T> = Var<T> & {
  _kind: 'flow';
};
type SessionVar<T> = Var<T> & {
  _kind: 'session';
};
type LocalVar<T> = Var<T> & {
  _kind: 'local';
};
export declare function Flow<T = any>(name: string, initialValue?: T): FlowVar<T>;
export declare function Session<T = any>(name: string, initialValue?: T): SessionVar<T>;
export declare function Local<T = any>(name: string): LocalVar<T>;
export declare function use<T>(v: Var<T>): import('./expr.js').Expr<any>;
export declare function __collectInitial(): InitialState;
export {};
