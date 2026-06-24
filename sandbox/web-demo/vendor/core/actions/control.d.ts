/**
 * Control-flow actions: sequential batches and conditional branches.
 */
import type { Action } from '../action.js';
import type { ExprRef } from '../expr.js';
/** Run a list of actions sequentially, rolling back state if any fails. */
export interface BatchAction {
    readonly type: 'batch';
    readonly params: {
        readonly actions: readonly Action[];
        readonly atomic?: boolean;
    };
}
/** Conditionally execute one of the two action branches. */
export interface WhenAction {
    readonly type: 'when';
    readonly params: {
        readonly if: ExprRef;
        readonly then: readonly Action[];
        readonly else?: readonly Action[];
    };
}
//# sourceMappingURL=control.d.ts.map