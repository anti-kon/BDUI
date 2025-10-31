import ButtonDefinition from '../manifests/Button/index.js';
import ColumnDefinition from '../manifests/Column/index.js';
import RowDefinition from '../manifests/Row/index.js';
import TextDefinition from '../manifests/Text/index.js';
import { createComponentRegistry } from './componentRegistry.js';
import type { ComponentDefinition, RendererPlatform, WebComponentRenderer } from './types.js';

const baseComponentDefinitions: ReadonlyArray<ComponentDefinition<any>> = [
  ButtonDefinition,
  ColumnDefinition,
  RowDefinition,
  TextDefinition,
];

export const componentRegistry = createComponentRegistry(baseComponentDefinitions);

export const componentDefinitions = componentRegistry.definitions;

export const componentDefinitionMap = new Map(componentRegistry.definitionMap);

export function getComponentDefinition(type: string) {
  return componentRegistry.getDefinition(type);
}

export function getComponentRendererByPlatform(platform: RendererPlatform, type: string) {
  return componentRegistry.getRendererByPlatform(platform, type);
}

export function getWebComponentRenderer(type: string) {
  return componentRegistry.getRenderer(type);
}
