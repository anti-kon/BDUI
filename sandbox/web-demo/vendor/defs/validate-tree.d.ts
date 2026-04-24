import type { BDUIElement } from '@bdui/core';
import type { ComponentManifest } from './define.js';
export interface TreeValidationIssue {
    readonly path: string;
    readonly code: string;
    readonly message: string;
}
export interface TreeValidationResult {
    readonly ok: boolean;
    readonly issues: readonly TreeValidationIssue[];
}
export declare function validateTree(root: BDUIElement, manifestMap?: ReadonlyMap<string, ComponentManifest>): TreeValidationResult;
//# sourceMappingURL=validate-tree.d.ts.map