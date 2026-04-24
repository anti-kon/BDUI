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
const baseComponentDefinitions = [
    ButtonDefinition,
    CheckboxDefinition,
    ColumnDefinition,
    DividerDefinition,
    IfDefinition,
    ImageDefinition,
    InputDefinition,
    RowDefinition,
    SelectDefinition,
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
export { createComponentRegistry } from './componentRegistry.js';
//# sourceMappingURL=index.js.map