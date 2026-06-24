import type { ExprRef, StateTarget } from '@bdui/core';
import { type StateVar } from './state.js';
/** Targetable reference — string like "flow.counter", StateVar, or explicit. */
export type Target = string | StateTarget | StateVar<unknown>;
export declare function parseTarget(target: Target): StateTarget;
export declare function ensureExprRef(value: unknown): ExprRef;
//# sourceMappingURL=target.d.ts.map