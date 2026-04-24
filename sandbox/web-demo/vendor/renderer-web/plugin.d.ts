import { evaluateGuard, type RendererPlugin } from '@bdui/runtime';
export interface WebPluginOptions {
    readonly urlSync?: boolean;
}
export declare function createWebPlugin(options?: WebPluginOptions): RendererPlugin<HTMLElement>;
export declare const __evalGuard: typeof evaluateGuard;
//# sourceMappingURL=plugin.d.ts.map