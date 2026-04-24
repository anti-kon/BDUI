import type { ComponentDefinition, RendererPlatform, WebComponentRenderer } from './types.js';
export interface ComponentRegistry<TDefinition extends ComponentDefinition = ComponentDefinition> {
    readonly definitions: ReadonlyArray<TDefinition>;
    readonly definitionMap: ReadonlyMap<string, TDefinition>;
    getDefinition(type: string): TDefinition | undefined;
    getRenderer(type: string): WebComponentRenderer | undefined;
    getRendererByPlatform(platform: RendererPlatform, type: string): unknown;
}
export declare function createComponentRegistry<TDefinition extends ComponentDefinition>(definitions: ReadonlyArray<TDefinition>): ComponentRegistry<TDefinition>;
//# sourceMappingURL=componentRegistry.d.ts.map