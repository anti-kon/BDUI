import ButtonDefinition from './Button/manifest.js';
import ColumnDefinition from './Column/manifest.js';
import RowDefinition from './Row/manifest.js';
import TextDefinition from './Text/manifest.js';
import { createComponentRegistry } from './registry.js';
const baseComponentDefinitions = [
  ButtonDefinition,
  ColumnDefinition,
  RowDefinition,
  TextDefinition,
];
export const componentRegistry = createComponentRegistry(baseComponentDefinitions);
export const componentDefinitions = componentRegistry.definitions;
export const componentDefinitionMap = new Map(componentRegistry.definitionMap);
export function getComponentDefinition(type) {
  return componentRegistry.getDefinition(type);
}
export function getComponentRendererByPlatform(platform, type) {
  return componentRegistry.getRendererByPlatform(platform, type);
}
export function getWebComponentRenderer(type) {
  return componentRegistry.getRenderer(type);
}
