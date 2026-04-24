/** Hard limits protecting the parser and interpreter from abuse. */
export interface ExprLimits {
    readonly maxSourceLength: number;
    readonly maxDepth: number;
    readonly maxNodes: number;
}
export declare const DEFAULT_LIMITS: ExprLimits;
/** Identifiers explicitly forbidden to prevent prototype pollution. */
export declare const FORBIDDEN_IDENTIFIERS: readonly string[];
//# sourceMappingURL=limits.d.ts.map