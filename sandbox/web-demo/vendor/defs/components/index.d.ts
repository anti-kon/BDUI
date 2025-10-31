import type { ComponentDefinition, WebComponentRenderer } from './types.js';
export declare const componentDefinitions: ReadonlyArray<ComponentDefinition>;
export declare const componentDefinitionMap: Map<string, ComponentDefinition>;
export declare function getComponentDefinition(type: string): ComponentDefinition | undefined;
export declare const webComponentRenderers: Map<string, WebComponentRenderer>;
export declare function getWebComponentRenderer(type: string): WebComponentRenderer | undefined;
