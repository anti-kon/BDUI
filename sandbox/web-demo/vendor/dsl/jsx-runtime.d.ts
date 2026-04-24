type JsxComponent<TProps> = (props: TProps) => unknown;
export declare const Fragment: <P extends {
    children?: unknown;
}>(props: P) => unknown;
export declare function jsx<TProps extends Record<string, unknown>>(type: JsxComponent<TProps> | string, props: TProps | null, key?: unknown): unknown;
export declare const jsxs: typeof jsx;
export declare const jsxDEV: typeof jsx;
export {};
//# sourceMappingURL=jsx-runtime.d.ts.map