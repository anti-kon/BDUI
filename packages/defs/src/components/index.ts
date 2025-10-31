import ButtonDefinition from './Button/manifest.js';
import ColumnDefinition from './Column/manifest.js';
import RowDefinition from './Row/manifest.js';
import TextDefinition from './Text/manifest.js';
import type { ComponentDefinition, WebComponentRenderer } from './types.js';

export const componentDefinitions: ReadonlyArray<ComponentDefinition> = Object.freeze([
  ButtonDefinition as ComponentDefinition,
  ColumnDefinition as ComponentDefinition,
  RowDefinition as ComponentDefinition,
  TextDefinition as ComponentDefinition,
]);

export const componentDefinitionMap = new Map(
  componentDefinitions.map((definition) => [definition.manifest.type, definition] as const),
);

export function getComponentDefinition(type: string) {
  return componentDefinitionMap.get(type);
}

export const webComponentRenderers = new Map<string, WebComponentRenderer>();
for (const definition of componentDefinitions) {
  const renderer = definition.renderers.web;
  if (renderer) {
    webComponentRenderers.set(definition.manifest.type, renderer);
  }
}

export function getWebComponentRenderer(type: string) {
  return webComponentRenderers.get(type);
}
