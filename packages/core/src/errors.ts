/** Base class for all public BDUI errors. */
export class BDUIError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = 'BDUIError';
  }
}

export class ValidationError extends BDUIError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super(message, 'BDUI_VALIDATION', details);
    this.name = 'ValidationError';
  }
}

export class FlowError extends BDUIError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super(message, 'BDUI_FLOW', details);
    this.name = 'FlowError';
  }
}

export class ExpressionError extends BDUIError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super(message, 'BDUI_EXPR', details);
    this.name = 'ExpressionError';
  }
}

export class ActionError extends BDUIError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super(message, 'BDUI_ACTION', details);
    this.name = 'ActionError';
  }
}
