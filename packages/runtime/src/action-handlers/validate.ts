import type { ValidateAction } from '@bdui/core';

import type { ActionContext, StateValidationResult } from './context.js';

function normalizeValidationResult(result: StateValidationResult): {
  readonly ok: boolean;
  readonly errors: readonly string[];
} {
  if (typeof result === 'boolean') return { ok: result, errors: result ? [] : ['invalid'] };
  if (typeof result === 'string') return { ok: false, errors: [result] };
  if (Array.isArray(result)) {
    const errors = result as readonly string[];
    return { ok: errors.length === 0, errors };
  }
  const objectResult = result as { readonly ok: boolean; readonly errors?: readonly string[] };
  return {
    ok: objectResult.ok,
    errors: objectResult.errors ?? (objectResult.ok ? [] : ['invalid']),
  };
}

export async function handleValidate(ctx: ActionContext, action: ValidateAction): Promise<void> {
  const validator = ctx.validators?.[action.params.schemaRef];
  if (!validator) {
    ctx.bus.emit('error', {
      action,
      error: new Error(`Validator not found: ${action.params.schemaRef}`),
    });
    return;
  }

  try {
    const value = ctx.state.get(action.params.target);
    const result = normalizeValidationResult(
      await validator(value, {
        schemaRef: action.params.schemaRef,
        target: action.params.target,
        state: ctx.state.snapshot(),
      }),
    );
    const current =
      (ctx.state.read('local', '__validation') as Record<string, unknown> | undefined) ?? {};
    ctx.state.write('local', '__validation', {
      ...current,
      [action.params.schemaRef]: {
        ok: result.ok,
        errors: result.errors,
        target: action.params.target,
      },
    });
    ctx.bus.emit('stateDirty', {});
    if (!result.ok) {
      ctx.bus.emit('error', {
        action,
        error: Object.assign(new Error(`Validation failed: ${action.params.schemaRef}`), {
          errors: result.errors,
        }),
      });
    }
  } catch (error) {
    ctx.bus.emit('error', { action, error });
  }
}
