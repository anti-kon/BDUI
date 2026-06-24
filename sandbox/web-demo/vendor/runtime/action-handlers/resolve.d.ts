import type { RuntimeStateController } from '../state.js';
export declare function toNumber(value: unknown): number;
/**
 * Deeply resolve expression references, `{{ }}` templates and plain values
 * against the current state snapshot. Arrays and plain objects are resolved
 * element-by-element.
 */
export declare function resolveValue(value: unknown, state: RuntimeStateController, params?: Record<string, unknown>): unknown;
//# sourceMappingURL=resolve.d.ts.map