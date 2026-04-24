import type { BDUIElement } from '@bdui/core';
export type ChildMode = 'none' | 'text' | 'nodes' | 'slots';
export interface NodeCfg {
    readonly children: ChildMode;
    readonly mapToProp?: string;
    readonly aliases?: Readonly<Record<string, string>>;
    readonly events?: readonly string[];
}
export declare function createNode(type: string, props: Record<string, unknown> | null, cfg: NodeCfg): BDUIElement;
//# sourceMappingURL=runtime.d.ts.map