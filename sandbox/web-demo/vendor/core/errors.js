/** Base class for all public BDUI errors. */
export class BDUIError extends Error {
    code;
    details;
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'BDUIError';
    }
}
export class ValidationError extends BDUIError {
    constructor(message, details) {
        super(message, 'BDUI_VALIDATION', details);
        this.name = 'ValidationError';
    }
}
export class FlowError extends BDUIError {
    constructor(message, details) {
        super(message, 'BDUI_FLOW', details);
        this.name = 'FlowError';
    }
}
export class ExpressionError extends BDUIError {
    constructor(message, details) {
        super(message, 'BDUI_EXPR', details);
        this.name = 'ExpressionError';
    }
}
export class ActionError extends BDUIError {
    constructor(message, details) {
        super(message, 'BDUI_ACTION', details);
        this.name = 'ActionError';
    }
}
//# sourceMappingURL=errors.js.map