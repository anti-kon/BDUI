/**
 * Arithmetic, comparison and equality semantics for the expression language.
 * Kept separate from the tree-walker so the operator rules read as a unit.
 */
export declare function applyBinary(op: string, l: unknown, r: unknown): unknown;
export declare function looseEquals(l: unknown, r: unknown): boolean;
//# sourceMappingURL=operators.d.ts.map