import ButtonDefinition from '../manifests/Button/index.js';
import CheckboxDefinition from '../manifests/Checkbox/index.js';
import ColumnDefinition from '../manifests/Column/index.js';
import DividerDefinition from '../manifests/Divider/index.js';
import IfDefinition from '../manifests/If/index.js';
import ImageDefinition from '../manifests/Image/index.js';
import InputDefinition from '../manifests/Input/index.js';
import RowDefinition from '../manifests/Row/index.js';
import SelectDefinition from '../manifests/Select/index.js';
import TextDefinition from '../manifests/Text/index.js';
import { createComponentRegistry } from './componentRegistry.js';
import type { ComponentDefinition, RendererPlatform } from './types.js';

const baseComponentDefinitions: ReadonlyArray<ComponentDefinition> = [
  ButtonDefinition as ComponentDefinition,
  CheckboxDefinition as ComponentDefinition,
  ColumnDefinition as ComponentDefinition,
  DividerDefinition as ComponentDefinition,
  IfDefinition as ComponentDefinition,
  ImageDefinition as ComponentDefinition,
  InputDefinition as ComponentDefinition,
  RowDefinition as ComponentDefinition,
  SelectDefinition as ComponentDefinition,
  TextDefinition as ComponentDefinition,
];

export const componentRegistry = createComponentRegistry(baseComponentDefinitions);

export const componentDefinitions = componentRegistry.definitions;

export const componentDefinitionMap = new Map(componentRegistry.definitionMap);

export function getComponentDefinition(type: string): ComponentDefinition | undefined {
  return componentRegistry.getDefinition(type);
}

export function getComponentRendererByPlatform(platform: RendererPlatform, type: string): unknown {
  return componentRegistry.getRendererByPlatform(platform, type);
}

export function getWebComponentRenderer(type: string) {
  return componentRegistry.getRenderer(type);
}

export { createComponentRegistry } from './componentRegistry.js';
