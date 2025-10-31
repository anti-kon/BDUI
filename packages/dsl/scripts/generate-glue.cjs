const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

async function loadManifests() {
  const defsPath = path.resolve(__dirname, '../../defs/dist/index.js');
  const defs = await import(pathToFileURL(defsPath).href);
  return [defs.TextManifest, defs.ButtonManifest, defs.RowManifest, defs.ColumnManifest].filter(
    Boolean,
  );
}

function childModeFor(manifest) {
  switch (manifest.children?.kind) {
    case 'none':
      return 'none';
    case 'text':
      return 'text';
    case 'nodes':
    case 'slots':
      return 'nodes';
    default:
      return 'none';
  }
}

function buildConfig(manifest) {
  const config = {
    children: childModeFor(manifest),
  };

  if (manifest.children?.kind === 'text') {
    config.mapToProp = manifest.children.mapToProp || 'text';
  }

  if (manifest.aliases && Object.keys(manifest.aliases).length > 0) {
    config.aliases = manifest.aliases;
  }

  return config;
}

function render(manifests) {
  const lines = [
    '// AUTO-GENERATED. Do not edit.',
    "import { createNode } from '../glue/runtime.js';",
    '',
  ];

  for (const manifest of manifests) {
    const cfg = JSON.stringify(buildConfig(manifest));
    lines.push(`export function ${manifest.type}(props: any): any {`);
    lines.push(`  return createNode(${JSON.stringify(manifest.type)}, props, ${cfg});`);
    lines.push('}');
  }

  lines.push('');
  return lines.join('\n');
}

async function run() {
  const manifests = await loadManifests();
  const outPath = path.resolve(__dirname, '../src/generated/components.ts');
  const contents = render(manifests);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, contents, 'utf-8');
  console.log('Generated DSL components at', outPath);
}

run().catch((e) => {
  console.error('DSL glue generation failed:', e);
  process.exit(1);
});
