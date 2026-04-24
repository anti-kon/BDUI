const fs = require('node:fs');
const path = require('node:path');

const { loadManifests } = require('./lib/manifests.cjs');
const {
  createPropsSchemaLoader,
  createCoreTypeLoader,
  buildContractSchema,
  buildActionDefs,
} = require('./lib/schema-builder.cjs');

const args = new Set(process.argv.slice(2));
const watchMode = args.has('--watch');
const inspectMode = args.has('--inspect');

const defsSrcGlob = path.resolve(__dirname, '../../defs/src/**/*.ts');
const defsTsconfig = path.resolve(__dirname, '../../defs/tsconfig.json');
const defsBundle = path.resolve(__dirname, '../../defs/dist/index.js');
const coreSrcGlob = path.resolve(__dirname, '../../core/src/**/*.ts');
const coreTsconfig = path.resolve(__dirname, '../../core/tsconfig.json');
const outPath = path.resolve(__dirname, '../src/generated/schema.generated.ts');

async function formatTypeScript(source) {
  const prettier = await import('prettier');
  return prettier.format(source, {
    parser: 'typescript',
    singleQuote: true,
    trailingComma: 'all',
  });
}

const loadPropsSchema = createPropsSchemaLoader({
  sourceGlob: defsSrcGlob,
  tsconfigPath: defsTsconfig,
});

const loadCoreTypeSchema = createCoreTypeLoader({
  sourceGlob: coreSrcGlob,
  tsconfigPath: coreTsconfig,
});

async function buildSchema() {
  const manifests = await loadManifests(defsBundle);
  const perComponentSchemas = manifests.map((manifest) => loadPropsSchema(manifest.propsTypeName));
  const actionDefs = buildActionDefs(loadCoreTypeSchema);
  const contractSchema = buildContractSchema(manifests, perComponentSchemas, actionDefs);

  const lines = [
    '// AUTO-GENERATED. Do not edit.',
    `export const contractSchema = ${JSON.stringify(contractSchema, null, 2)} as const;`,
    '',
  ];

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, await formatTypeScript(lines.join('\n')), 'utf-8');

  if (inspectMode) {
    const manifestSummary = manifests.map((manifest) => ({
      type: manifest.type,
      props: manifest.propsTypeName,
      events: manifest.events ?? [],
    }));
    console.log('[schema] manifests:', manifestSummary);
    console.log('[schema] actionDefs:', Object.keys(actionDefs));
  }

  console.log('Generated schema at', outPath);
}

async function runOnce() {
  try {
    await buildSchema();
  } catch (error) {
    console.error('Schema generation failed:', error);
    if (!watchMode) {
      process.exit(1);
    }
  }
}

if (watchMode) {
  const chokidar = require('chokidar');
  const watcher = chokidar.watch([
    path.resolve(__dirname, '../../defs/src'),
    path.resolve(__dirname, '../../core/src'),
    path.resolve(__dirname, '../'),
  ]);

  let scheduled = false;
  let running = false;

  const trigger = () => {
    if (running) {
      scheduled = true;
      return;
    }
    running = true;
    runOnce().finally(() => {
      running = false;
      if (scheduled) {
        scheduled = false;
        trigger();
      }
    });
  };

  watcher.on('ready', () => {
    console.log('[schema] watching for changes...');
    trigger();
  });

  watcher.on('all', (event, filePath) => {
    console.log(`[schema] change detected (${event}): ${filePath}`);
    trigger();
  });
} else {
  runOnce();
}
