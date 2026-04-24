export type RegistryErrorCode =
  | 'BAD_REQUEST'
  | 'VALIDATION_FAILED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNPROCESSABLE'
  | 'INTERNAL';

const STATUS_MAP: Record<RegistryErrorCode, number> = {
  BAD_REQUEST: 400,
  VALIDATION_FAILED: 422,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL: 500,
};

export class RegistryError extends Error {
  readonly code: RegistryErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: RegistryErrorCode, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.status = STATUS_MAP[code];
    this.details = details;
  }
}

export function toErrorBody(error: RegistryError): {
  error: { code: RegistryErrorCode; message: string; details?: unknown };
} {
  return {
    error: {
      code: error.code,
      message: error.message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    },
  };
}
