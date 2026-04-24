import type { ComponentDefinition, RendererPlatform, WebComponentRenderer } from './types.js';

type RendererMaps = Map<RendererPlatform, Map<string, unknown>>;

function freezeDefinitions<TDefinition extends ComponentDefinition>(
  definitions: ReadonlyArray<TDefinition>,
): ReadonlyArray<TDefinition> {
  return Object.freeze([...definitions]);
}

function ensurePlatformMap(
  storage: RendererMaps,
  platform: RendererPlatform,
): Map<string, unknown> {
  const existing = storage.get(platform);
  if (existing) return existing;
  const next = new Map<string, unknown>();
  storage.set(platform, next);
  return next;
}

export interface ComponentRegistry<TDefinition extends ComponentDefinition = ComponentDefinition> {
  readonly definitions: ReadonlyArray<TDefinition>;
  readonly definitionMap: ReadonlyMap<string, TDefinition>;
  getDefinition(type: string): TDefinition | undefined;
  getRenderer(type: string): WebComponentRenderer | undefined;
  getRendererByPlatform(platform: RendererPlatform, type: string): unknown;
}

export function createComponentRegistry<TDefinition extends ComponentDefinition>(
  definitions: ReadonlyArray<TDefinition>,
): ComponentRegistry<TDefinition> {
  const frozenDefinitions = freezeDefinitions(definitions);
  const definitionMap = new Map<string, TDefinition>();
  const rendererMaps: RendererMaps = new Map();

  for (const definition of frozenDefinitions) {
    const { manifest, renderers } = definition;
    const type = manifest.type;

    if (definitionMap.has(type)) {
      throw new Error(`Duplicate component type detected: "${type}".`);
    }

    definitionMap.set(type, definition);

    const entries = Object.entries(renderers ?? {}) as Array<[RendererPlatform, unknown]>;

    for (const [platform, renderer] of entries) {
      if (!renderer) continue;
      const platformMap = ensurePlatformMap(rendererMaps, platform);
      platformMap.set(type, renderer);
    }
  }

  const readonlyDefinitionMap = definitionMap as ReadonlyMap<string, TDefinition>;

  function getRendererByPlatform(platform: RendererPlatform, type: string): unknown {
    return rendererMaps.get(platform)?.get(type);
  }

  return {
    definitions: frozenDefinitions,
    definitionMap: readonlyDefinitionMap,
    getDefinition: (type) => definitionMap.get(type),
    getRenderer: (type) => getRendererByPlatform('web', type) as WebComponentRenderer | undefined,
    getRendererByPlatform,
  };
}
