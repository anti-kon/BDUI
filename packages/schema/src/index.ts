import Ajv, { type ErrorObject, type Options, type ValidateFunction } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

import { contractSchema } from './generated/schema.generated.js';
export { contractSchema } from './generated/schema.generated.js';

export interface ValidateOptions {
  readonly allErrors?: boolean;
  readonly strict?: boolean | 'log';
  readonly messages?: boolean;
}

export interface ValidationReport {
  readonly ok: boolean;
  readonly errors: readonly ErrorObject[];
}

function createAjv(options: ValidateOptions = {}): Ajv {
  const ajvOptions: Options = {
    allErrors: options.allErrors ?? true,
    strict: options.strict ?? false,
    messages: options.messages ?? true,
  };
  const ajv = new Ajv(ajvOptions);
  addFormats(ajv);
  return ajv;
}

let cachedValidate: ValidateFunction | null = null;

function getValidator(): ValidateFunction {
  if (!cachedValidate) {
    const ajv = createAjv();
    cachedValidate = ajv.compile(contractSchema as unknown as object);
  }
  return cachedValidate;
}

export function validateContract(json: unknown): ValidationReport {
  const validate = getValidator();
  const ok = validate(json);
  return {
    ok: !!ok,
    errors: (validate.errors as readonly ErrorObject[] | null) ?? [],
  };
}

export function formatValidationErrors(errors: readonly ErrorObject[]): string {
  if (errors.length === 0) return '';
  return errors
    .map((e) => {
      const path = e.instancePath || '/';
      return `  at ${path}: ${e.message ?? 'validation failed'}`;
    })
    .join('\n');
}

export class ContractValidationError extends Error {
  override readonly name = 'ContractValidationError';
  readonly issues: readonly ErrorObject[];

  constructor(message: string, issues: readonly ErrorObject[]) {
    super(`${message}\n${formatValidationErrors(issues)}`);
    this.issues = issues;
  }
}

export function assertValidContract(json: unknown): void {
  const { ok, errors } = validateContract(json);
  if (!ok) {
    throw new ContractValidationError('Invalid BDUI contract', errors);
  }
}
