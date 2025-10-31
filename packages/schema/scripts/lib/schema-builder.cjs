const path = require('node:path');
const { createGenerator } = require('ts-json-schema-generator');

function createPropsSchemaLoader({ sourceGlob, tsconfigPath }) {
  return function propsSchemaFor(typeName) {
    const config = {
      path: path.resolve(sourceGlob),
      tsconfig: path.resolve(tsconfigPath),
      type: typeName,
      expose: 'export',
      topRef: false,
      jsDoc: 'extended',
      additionalProperties: false,
    };
    const generator = createGenerator(config);
    return generator.createSchema(typeName);
  };
}

function schemaForComponent(manifest, propsSchema) {
  const props =
    propsSchema.definitions?.[manifest.propsTypeName] ||
    propsSchema.components?.schemas?.[manifest.propsTypeName] ||
    propsSchema;

  const properties = props.properties ? { ...props.properties } : {};
  const required = new Set(props.required || []);

  if (manifest.aliases) {
    for (const [alias, real] of Object.entries(manifest.aliases)) {
      if (properties[alias]) {
        properties[real] = properties[alias];
        delete properties[alias];
        if (required.has(alias)) {
          required.delete(alias);
          required.add(real);
        }
      }
    }
  }

  if (manifest.children?.kind === 'text') {
    const key = manifest.children.mapToProp || 'text';
    if (!properties[key]) properties[key] = { type: 'string' };
  } else if (manifest.children?.kind === 'nodes') {
    properties.children = { type: 'array', items: { $ref: '#/$defs/Node' } };
  }

  if (manifest.events?.includes('onAction')) {
    properties.onAction = { type: 'array' };
  }

  return { properties, required: Array.from(required) };
}

function buildContractSchema(manifests, perCompSchemas) {
  const nodeTypes = manifests.map((m) => m.type);
  const schema = {
    $id: 'https://bdui.dev/schema/contract.json',
    type: 'object',
    required: ['meta', 'navigation'],
    properties: {
      meta: {
        type: 'object',
        required: ['contractId', 'version', 'schemaVersion', 'generatedAt'],
        properties: {
          contractId: { type: 'string' },
          version: { type: 'string' },
          schemaVersion: { type: 'string' },
          signature: { type: 'string' },
        },
        additionalProperties: true,
      },
      theme: { type: 'object' },
      initial: {
        type: 'object',
        properties: {
          flow: { type: 'object', additionalProperties: true },
          session: { type: 'object', additionalProperties: true },
        },
        additionalProperties: false,
      },
      dataSources: { type: 'array' },
      navigation: {
        type: 'object',
        required: ['initialRoute', 'routes'],
        properties: {
          initialRoute: { type: 'string' },
          urlSync: { type: 'boolean' },
          routes: {
            type: 'array',
            items: {
              oneOf: [
                {
                  type: 'object',
                  required: ['id', 'node'],
                  properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    path: { type: 'string' },
                    cache: { type: 'object' },
                    node: { $ref: '#/$defs/Node' },
                  },
                  additionalProperties: false,
                },
                {
                  type: 'object',
                  required: ['id', 'type', 'startStep', 'steps'],
                  properties: {
                    id: { type: 'string' },
                    type: { const: 'flow' },
                    title: { type: 'string' },
                    startStep: { type: 'string' },
                    persistence: { type: 'object', additionalProperties: true },
                    steps: { type: 'array', items: { $ref: '#/$defs/Step' } },
                  },
                  additionalProperties: false,
                },
              ],
            },
          },
        },
      },
    },
    $defs: {
      Node: {
        type: 'object',
        required: ['type'],
        properties: {
          type: { enum: nodeTypes },
          id: { type: 'string' },
          modifiers: { type: 'object' },
          children: { type: 'array', items: { $ref: '#/$defs/Node' } },
          onAction: { type: 'array' },
        },
        additionalProperties: true,
        allOf: [],
      },
      Step: {
        type: 'object',
        required: ['id', 'children'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          children: { type: 'array', items: { $ref: '#/$defs/Node' } },
          onEnter: { type: 'array', items: { type: 'object' } },
          onExit: { type: 'array', items: { type: 'object' } },
          onResume: { type: 'array', items: { type: 'object' } },
          transitions: {
            type: 'array',
            items: {
              type: 'object',
              required: ['to'],
              properties: {
                guard: { type: 'string' },
                to: { type: 'string' },
              },
              additionalProperties: false,
            },
          },
        },
        additionalProperties: false,
      },
    },
    additionalProperties: false,
  };

  const collected = {};
  for (const componentSchema of perCompSchemas) {
    const defs =
      componentSchema.definitions ||
      componentSchema.$defs ||
      componentSchema.components?.schemas ||
      {};
    Object.assign(collected, defs);
  }
  if (Object.keys(collected).length) {
    schema.definitions = collected;
    schema.$defs = Object.assign(schema.$defs || {}, collected);
  }

  for (let i = 0; i < manifests.length; i++) {
    const manifest = manifests[i];
    const ref = schemaForComponent(manifest, perCompSchemas[i]);
    const thenProps = {
      type: 'object',
      properties: { ...ref.properties, type: { const: manifest.type } },
      required: ['type', ...(ref.required || [])],
      additionalProperties: true,
    };
    schema.$defs.Node.allOf.push({
      if: { properties: { type: { const: manifest.type } } },
      then: thenProps,
    });
  }

  return schema;
}

module.exports = {
  createPropsSchemaLoader,
  schemaForComponent,
  buildContractSchema,
};
