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

    const entries = Object.entries(renderers ?? {}) as Array<
      [RendererPlatform, TDefinition['renderers'][RendererPlatform]]
    >;

    for (const [platform, renderer] of entries) {
      if (!renderer) continue;
      const platformMap = ensurePlatformMap(rendererMaps, platform);
      platformMap.set(type, renderer as unknown);
    }
  }

  const readonlyDefinitionMap = definitionMap as ReadonlyMap<string, TDefinition>;

  function getRendererByPlatform<P extends RendererPlatform>(
    platform: P,
    type: string,
  ): TDefinition['renderers'][P] | undefined {
    return rendererMaps.get(platform)?.get(type) as TDefinition['renderers'][P] | undefined;
  }

  return {
    definitions: frozenDefinitions,
    definitionMap: readonlyDefinitionMap,
    getDefinition: (type) => definitionMap.get(type),
    getRenderer: (type) => getRendererByPlatform('web', type) as WebComponentRenderer | undefined,
    getRendererByPlatform,
  };
}
