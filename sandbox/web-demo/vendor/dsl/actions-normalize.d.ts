import type { Action } from '@bdui/core';
import type { ShortAction } from './short-action.js';
export type { ShortAction } from './short-action.js';
export type { Target } from './target.js';
export { parseTarget } from './target.js';
export declare function normalizeOne(literal: ShortAction | Action): Action;
export declare function normalizeActions(input: ShortAction | Action | readonly (ShortAction | Action)[] | null | undefined): Action[];
//# sourceMappingURL=actions-normalize.d.ts.map