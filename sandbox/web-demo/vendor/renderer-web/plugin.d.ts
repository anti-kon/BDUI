import type { Contract } from '@bdui/core';
import { evaluateGuard, type RendererPlugin } from '@bdui/runtime';
export interface WebPluginOptions {
    readonly urlSync?: boolean;
    readonly contract?: Contract;
}
export declare function createWebPlugin(options?: WebPluginOptions): RendererPlugin<HTMLElement>;
export declare const __evalGuard: typeof evaluateGuard;
//# sourceMappingURL=plugin.d.ts.map