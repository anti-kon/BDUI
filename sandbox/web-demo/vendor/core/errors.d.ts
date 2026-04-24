/** Base class for all public BDUI errors. */
export declare class BDUIError extends Error {
    readonly code: string;
    readonly details?: Readonly<Record<string, unknown>> | undefined;
    constructor(message: string, code: string, details?: Readonly<Record<string, unknown>> | undefined);
}
export declare class ValidationError extends BDUIError {
    constructor(message: string, details?: Readonly<Record<string, unknown>>);
}
export declare class FlowError extends BDUIError {
    constructor(message: string, details?: Readonly<Record<string, unknown>>);
}
export declare class ExpressionError extends BDUIError {
    constructor(message: string, details?: Readonly<Record<string, unknown>>);
}
export declare class ActionError extends BDUIError {
    constructor(message: string, details?: Readonly<Record<string, unknown>>);
}
//# sourceMappingURL=errors.d.ts.map