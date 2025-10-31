import ButtonDefinition from './Button/manifest.js';
import ColumnDefinition from './Column/manifest.js';
import RowDefinition from './Row/manifest.js';
import TextDefinition from './Text/manifest.js';
export const componentDefinitions = Object.freeze([
  ButtonDefinition,
  ColumnDefinition,
  RowDefinition,
  TextDefinition,
]);
export const componentDefinitionMap = new Map(
  componentDefinitions.map((definition) => [definition.manifest.type, definition]),
);
export function getComponentDefinition(type) {
  return componentDefinitionMap.get(type);
}
export const webComponentRenderers = new Map();
for (const definition of componentDefinitions) {
  const renderer = definition.renderers.web;
  if (renderer) {
    webComponentRenderers.set(definition.manifest.type, renderer);
  }
}
export function getWebComponentRenderer(type) {
  return webComponentRenderers.get(type);
}
