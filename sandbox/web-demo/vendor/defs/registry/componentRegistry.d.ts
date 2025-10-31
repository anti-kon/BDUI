import type { ComponentDefinition, RendererPlatform, WebComponentRenderer } from './types.js';
export type ComponentRegistry<TDefinition extends ComponentDefinition = ComponentDefinition> = {
  readonly definitions: ReadonlyArray<TDefinition>;
  readonly definitionMap: ReadonlyMap<string, TDefinition>;
  getDefinition(type: string): TDefinition | undefined;
  getRenderer(type: string): WebComponentRenderer | undefined;
  getRendererByPlatform<P extends RendererPlatform>(
    platform: P,
    type: string,
  ): TDefinition['renderers'][P] | undefined;
};
export declare function createComponentRegistry<TDefinition extends ComponentDefinition>(
  definitions: ReadonlyArray<TDefinition>,
): ComponentRegistry<TDefinition>;
