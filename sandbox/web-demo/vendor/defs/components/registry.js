function freezeDefinitions(definitions) {
  return Object.freeze([...definitions]);
}
function ensurePlatformMap(storage, platform) {
  const existing = storage.get(platform);
  if (existing) return existing;
  const next = new Map();
  storage.set(platform, next);
  return next;
}
export function createComponentRegistry(definitions) {
  const frozenDefinitions = freezeDefinitions(definitions);
  const definitionMap = new Map();
  const rendererMaps = new Map();
  for (const definition of frozenDefinitions) {
    const { manifest, renderers } = definition;
    const type = manifest.type;
    if (definitionMap.has(type)) {
      throw new Error(`Duplicate component type detected: "${type}".`);
    }
    definitionMap.set(type, definition);
    const entries = Object.entries(renderers ?? {});
    for (const [platform, renderer] of entries) {
      if (!renderer) continue;
      const platformMap = ensurePlatformMap(rendererMaps, platform);
      platformMap.set(type, renderer);
    }
  }
  const readonlyDefinitionMap = definitionMap;
  function getRendererByPlatform(platform, type) {
    return rendererMaps.get(platform)?.get(type);
  }
  return {
    definitions: frozenDefinitions,
    definitionMap: readonlyDefinitionMap,
    getDefinition: (type) => definitionMap.get(type),
    getRenderer: (type) => getRendererByPlatform('web', type),
    getRendererByPlatform,
  };
}
