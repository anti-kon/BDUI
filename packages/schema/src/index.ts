import Ajv from 'ajv';
import { contractSchema } from './generated/schema.generated.js';
export { contractSchema } from './generated/schema.generated.js';

const ajv = new Ajv({ allErrors: true, strict: false });

export function validateContract(json: unknown) {
  const validate = ajv.compile(contractSchema as any);
  const ok = validate(json);
  return { ok: !!ok, errors: validate.errors ?? [] };
}
