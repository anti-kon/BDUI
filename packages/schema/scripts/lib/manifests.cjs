const { pathToFileURL } = require('node:url');

async function loadManifests(defsEntry) {
  const defs = await import(pathToFileURL(defsEntry).href);

  if (Array.isArray(defs.componentDefinitions) && defs.componentDefinitions.length > 0) {
    const uniqueByType = new Map();
    for (const def of defs.componentDefinitions) {
      const manifest = def?.manifest;
      if (!manifest || typeof manifest.type !== 'string') continue;
      if (!uniqueByType.has(manifest.type)) {
        uniqueByType.set(manifest.type, manifest);
      }
    }
    return Array.from(uniqueByType.values()).sort((a, b) => a.type.localeCompare(b.type));
  }

  const fallback = Object.entries(defs)
    .filter(([key]) => key.endsWith('Manifest'))
    .map(([, value]) => value)
    .filter(Boolean)
    .sort((a, b) => {
      const aType = typeof a?.type === 'string' ? a.type : '';
      const bType = typeof b?.type === 'string' ? b.type : '';
      return aType.localeCompare(bType);
    });

  return fallback;
}

module.exports = { loadManifests };
