const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createGenerator } = require('ts-json-schema-generator');

function propsSchemaFor(typeName) {
  const config = {
    path: path.resolve(__dirname, '../../defs/src/**/*.ts'),
    tsconfig: path.resolve(__dirname, '../../defs/tsconfig.json'),
    type: typeName,
    expose: "export",
    topRef: false,
    jsDoc: "extended",
    additionalProperties: false,
  };
  const generator = createGenerator(config);
  return generator.createSchema(typeName);
}

async function loadManifests() {
  const defsPath = path.resolve(__dirname, '../../defs/dist/index.js');
  const defs = await import(pathToFileURL(defsPath).href);
  return [defs.TextManifest, defs.ButtonManifest, defs.RowManifest, defs.ColumnManifest].filter(Boolean);
}

function schemaForComponent(m, propsSchema) {
  const props =
    propsSchema.definitions?.[m.propsTypeName] ||
    propsSchema.components?.schemas?.[m.propsTypeName] ||
    propsSchema;

  const properties = props.properties ? { ...props.properties } : {};
  const required = new Set(props.required || []);

  if (m.aliases) {
    for (const [alias, real] of Object.entries(m.aliases)) {
      if (properties[alias]) {
        properties[real] = properties[alias];
        delete properties[alias];
        if (required.has(alias)) { required.delete(alias); required.add(real); }
      }
    }
  }

  if (m.children?.kind === 'text') {
    const key = m.children.mapToProp || 'text';
    if (!properties[key]) properties[key] = { type: 'string' };
  } else if (m.children?.kind === 'nodes') {
    properties['children'] = { type: 'array', items: { $ref: "#/$defs/Node" } };
  }

  if (m.events?.includes('onAction')) {
    properties['onAction'] = { type: 'array' };
  }

  return { properties, required: Array.from(required) };
}

function makeContractSchema(manifests, perCompSchemas) {
  const nodeTypes = manifests.map(m => m.type);
  const schema = {
    $id: "https://bdui.dev/schema/contract.json",
    type: "object",
    required: ["meta","navigation"],
    properties: {
      meta: {
        type: "object",
        required: ["contractId","version","schemaVersion","generatedAt"],
        properties: {
          contractId: { type: "string" },
          version: { type: "string" },
          schemaVersion: { type: "string" },
          signature: { type: "string" }
        },
        additionalProperties: true
      },
      theme: { type: "object" },
      dataSources: { type: "array" },
      navigation: {
        type: "object",
        required: ["initialRoute","routes"],
        properties: {
          initialRoute: { type: "string" },
          urlSync: { type: "boolean" },
          routes: {
            type: "array",
            items: {
              type: "object",
              required: ["id","node"],
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                path: { type: "string" },
                cache: { type: "object" },
                node: { $ref: "#/$defs/Node" }
              },
              additionalProperties: false
            }
          }
        }
      }
    },
    $defs: {
      Node: {
        type: "object",
        required: ["type"],
        properties: {
          type: { enum: nodeTypes },
          id: { type: "string" },
          modifiers: { type: "object" },
          children: { type: "array", items: { $ref: "#/$defs/Node" } },
          onAction: { type: "array" }
        },
        additionalProperties: true,
        allOf: []
      }
    },
    additionalProperties: false
  };

  // merge definitions from props schemas
  const collected = {};
  for (const s of perCompSchemas) {
    const defs = s.definitions || s.$defs || s.components?.schemas || {};
    Object.assign(collected, defs);
  }
  if (Object.keys(collected).length) {
    schema.definitions = collected; // draft-07
    schema.$defs = Object.assign(schema.$defs || {}, collected); // modern
  }

  for (let i = 0; i < manifests.length; i++) {
    const m = manifests[i];
    const ref = schemaForComponent(m, perCompSchemas[i]);
    const thenProps = {
      type: "object",
      properties: { ...ref.properties, type: { const: m.type } },
      required: ["type", ...(ref.required || [])],
      additionalProperties: true
    };
    schema.$defs.Node.allOf.push({
      if: { properties: { type: { const: m.type } } },
      then: thenProps
    });
  }

  return schema;
}

async function run() {
  // build manifests first expected by caller, but this script assumes dist exists
  const manifests = await loadManifests();
  const perCompSchemas = manifests.map(m => propsSchemaFor(m.propsTypeName));
  const contractSchema = makeContractSchema(manifests, perCompSchemas);

  const outTs = `// AUTO-GENERATED. Do not edit.
export const contractSchema = ${JSON.stringify(contractSchema, null, 2)} as const;
`;
  const outPath = path.resolve(__dirname, '../src/generated/schema.generated.ts');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, outTs, 'utf-8');
  console.log('Generated schema at', outPath);
}

run().catch(e => { console.error('Schema generation failed:', e); process.exit(1); });
