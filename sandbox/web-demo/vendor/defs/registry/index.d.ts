import type { ComponentDefinition, RendererPlatform } from './types.js';
export declare const componentRegistry: import("./componentRegistry.js").ComponentRegistry<ComponentDefinition<import("./types.js").ComponentNode<unknown>>>;
export declare const componentDefinitions: readonly ComponentDefinition<import("./types.js").ComponentNode<unknown>>[];
export declare const componentDefinitionMap: Map<string, ComponentDefinition<import("./types.js").ComponentNode<unknown>>>;
export declare function getComponentDefinition(type: string): ComponentDefinition | undefined;
export declare function getComponentRendererByPlatform(platform: RendererPlatform, type: string): unknown;
export declare function getWebComponentRenderer(type: string): import("./types.js").WebComponentRenderer | undefined;
export { createComponentRegistry } from './componentRegistry.js';
//# sourceMappingURL=index.d.ts.map