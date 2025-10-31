import type { ComponentDefinition, RendererPlatform, WebComponentRenderer } from './types.js';
export declare const componentRegistry: import('./registry.js').ComponentRegistry<
  ComponentDefinition<any>
>;
export declare const componentDefinitions: readonly ComponentDefinition<any>[];
export declare const componentDefinitionMap: Map<string, ComponentDefinition<any>>;
export declare function getComponentDefinition(type: string): ComponentDefinition<any> | undefined;
export declare function getComponentRendererByPlatform(
  platform: RendererPlatform,
  type: string,
): WebComponentRenderer<any> | import('./types.js').AndroidComponentRenderer<any> | undefined;
export declare function getWebComponentRenderer(type: string): WebComponentRenderer | undefined;
