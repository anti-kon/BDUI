/** Pure, side-effect-free functions callable from expressions. */
export type BuiltinFn = (...args: readonly unknown[]) => unknown;
export declare const BUILTINS: Readonly<Record<string, BuiltinFn>>;
//# sourceMappingURL=builtins.d.ts.map