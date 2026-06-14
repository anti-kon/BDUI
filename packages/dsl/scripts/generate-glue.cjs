const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

async function loadManifests() {
  const defsPath = path.resolve(__dirname, '../../defs/dist/index.js');
  const defs = await import(pathToFileURL(defsPath).href);
  return defs.componentDefinitions.map((d) => d.manifest);
}

function childModeFor(manifest) {
  switch (manifest.children && manifest.children.kind) {
    case 'none':
      return 'none';
    case 'text':
      return 'text';
    case 'slots':
      return 'slots';
    case 'nodes':
    default:
      return 'nodes';
  }
}

function buildConfig(manifest) {
  const config = { children: childModeFor(manifest) };

  if (manifest.children && manifest.children.kind === 'text') {
    config.mapToProp = manifest.children.mapToProp || 'text';
  }

  if (manifest.aliases && Object.keys(manifest.aliases).length > 0) {
    config.aliases = manifest.aliases;
  }

  if (Array.isArray(manifest.events) && manifest.events.length > 0) {
    config.events = manifest.events;
  }

  return config;
}

function isReservedJsKeyword(name) {
  return ['If'].includes(name);
}

function render(manifests) {
  const propTypes = [...new Set(manifests.map((manifest) => manifest.propsTypeName))].sort();
  const lines = [
    '// AUTO-GENERATED. Do not edit.',
    "import type { BDUIElement } from '@bdui/core';",
    `import type { ${propTypes.join(', ')} } from '@bdui/defs';`,
    '',
    "import type { NoChildrenProps, NodeChildrenProps, TextChildrenProps } from '../component-props.js';",
    "import { createNode } from '../glue/runtime.js';",
    '',
  ];

  for (const manifest of manifests) {
    const cfg = JSON.stringify(buildConfig(manifest));
    const wrapper =
      childModeFor(manifest) === 'text'
        ? 'TextChildrenProps'
        : childModeFor(manifest) === 'none'
          ? 'NoChildrenProps'
          : 'NodeChildrenProps';
    const eventTypes =
      Array.isArray(manifest.events) && manifest.events.length > 0
        ? manifest.events.map((eventName) => JSON.stringify(eventName)).join(' | ')
        : 'never';
    const dslPropsName = `${manifest.type}DslProps`;
    // Component names are PascalCase and match JSX element names directly.
    // Even names that look like reserved operators (e.g. "If") are fine here
    // because TS allows identifier "If" as a function name.
    void isReservedJsKeyword; // referenced for clarity
    lines.push(
      `export type ${dslPropsName} = ${wrapper}<${manifest.propsTypeName}, ${eventTypes}>;`,
    );
    lines.push(`export function ${manifest.type}(props: ${dslPropsName}): BDUIElement {`);
    lines.push(
      `  return createNode(${JSON.stringify(manifest.type)}, props as unknown as Record<string, unknown>, ${cfg});`,
    );
    lines.push('}');
  }

  lines.push('');
  return lines.join('\n');
}

async function formatTypeScript(source) {
  const prettier = await import('prettier');
  return prettier.format(source, {
    parser: 'typescript',
    printWidth: 100,
    singleQuote: true,
    trailingComma: 'all',
  });
}

async function run() {
  const manifests = await loadManifests();
  const outPath = path.resolve(__dirname, '../src/generated/components.ts');
  const contents = await formatTypeScript(render(manifests));
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, contents, 'utf-8');
  console.log(`Generated ${manifests.length} DSL components at ${outPath}`);
}

run().catch((e) => {
  console.error('DSL glue generation failed:', e);
  process.exit(1);
});
