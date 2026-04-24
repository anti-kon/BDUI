const path = require('node:path');
const { createGenerator } = require('ts-json-schema-generator');

const EXPR_PATTERN = '^\\{\\{[\\s\\S]+\\}\\}$';

function createPropsSchemaLoader({ sourceGlob, tsconfigPath }) {
  return function propsSchemaFor(typeName) {
    const generator = createGenerator({
      path: path.resolve(sourceGlob),
      tsconfig: path.resolve(tsconfigPath),
      type: typeName,
      expose: 'export',
      topRef: false,
      jsDoc: 'none',
      additionalProperties: false,
    });
    return generator.createSchema(typeName);
  };
}

function createCoreTypeLoader({ sourceGlob, tsconfigPath }) {
  const generator = createGenerator({
    path: path.resolve(sourceGlob),
    tsconfig: path.resolve(tsconfigPath),
    type: '*',
    expose: 'export',
    topRef: false,
    jsDoc: 'none',
    additionalProperties: true,
  });
  return function coreTypeSchema(typeName) {
    return generator.createSchema(typeName);
  };
}

/**
 * Walk a schema and replace $ref targets pointing at ExprRef with a union of
 * string (wire format `{{...}}`) and the in-memory object form.
 * This keeps downstream consumers safe regardless of how they serialised
 * expressions.
 */
function rewriteExprRefs(schema) {
  if (!schema || typeof schema !== 'object') return;
  for (const key of Object.keys(schema)) {
    const value = schema[key];
    if (key === '$ref' && typeof value === 'string' && /\/ExprRef$/.test(value)) {
      delete schema.$ref;
      schema.oneOf = [{ type: 'string', pattern: EXPR_PATTERN }, { $ref: '#/$defs/ExprRef' }];
      return;
    }
    if (value && typeof value === 'object') {
      rewriteExprRefs(value);
    }
  }
}

/**
 * ts-json-schema-generator uses `#/definitions/...`. Our output uses `$defs`.
 * Walk the schema and rebase all refs to `#/$defs/...`.
 */
function rebaseRefs(schema) {
  if (!schema || typeof schema !== 'object') return;
  for (const key of Object.keys(schema)) {
    const value = schema[key];
    if (key === '$ref' && typeof value === 'string') {
      if (value.startsWith('#/definitions/')) {
        schema[key] = value.replace('#/definitions/', '#/$defs/');
      }
    } else if (value && typeof value === 'object') {
      rebaseRefs(value);
    }
  }
}

function cloneDefs(generatedSchema) {
  const defs =
    generatedSchema.definitions ||
    generatedSchema.$defs ||
    generatedSchema.components?.schemas ||
    {};
  const out = {};
  for (const [name, def] of Object.entries(defs)) {
    out[name] = JSON.parse(JSON.stringify(def));
  }
  return out;
}

function buildActionDefs(coreTypeSchema) {
  const actionSchema = coreTypeSchema('Action');
  const defs = cloneDefs(actionSchema);

  defs.ExprRef = {
    type: 'object',
    required: ['__bduiExpr', 'code'],
    properties: {
      __bduiExpr: { const: true },
      code: { type: 'string', minLength: 1 },
    },
    additionalProperties: false,
  };

  for (const def of Object.values(defs)) {
    rewriteExprRefs(def);
    rebaseRefs(def);
  }

  defs.ActionList = {
    type: 'array',
    items: { $ref: '#/$defs/Action' },
  };

  return defs;
}

function stripEnvelope(schema, typeName) {
  if (!schema || typeof schema !== 'object') return {};
  const direct =
    schema.definitions?.[typeName] ||
    schema.$defs?.[typeName] ||
    schema.components?.schemas?.[typeName];
  if (direct) return JSON.parse(JSON.stringify(direct));
  const clone = JSON.parse(JSON.stringify(schema));
  delete clone.definitions;
  delete clone.$defs;
  delete clone.$schema;
  delete clone.$ref;
  return clone;
}

function mapEventsToActionList(properties, events) {
  if (!Array.isArray(events)) return;
  for (const event of events) {
    properties[event] = { $ref: '#/$defs/ActionList' };
  }
}

function buildNodeDef(manifest, propsSchema) {
  const propsBody = stripEnvelope(propsSchema, manifest.propsTypeName);
  const properties = propsBody.properties ? { ...propsBody.properties } : {};
  const required = new Set(propsBody.required || []);

  if (manifest.aliases) {
    for (const [alias, real] of Object.entries(manifest.aliases)) {
      if (properties[alias]) {
        properties[real] = properties[alias];
        delete properties[alias];
      }
      if (required.has(alias)) {
        required.delete(alias);
        required.add(real);
      }
    }
  }

  properties.type = { const: manifest.type };
  properties.id = { type: 'string' };
  properties.modifiers = { $ref: '#/$defs/Modifiers' };

  if (manifest.children?.kind === 'text') {
    const key = manifest.children.mapToProp || 'text';
    if (!properties[key]) {
      properties[key] = {
        oneOf: [
          { type: 'string' },
          { $ref: '#/$defs/ExprRef' },
          { type: 'string', pattern: EXPR_PATTERN },
        ],
      };
    }
    if (manifest.children.required) required.add(key);
  } else if (manifest.children?.kind === 'nodes') {
    properties.children = { type: 'array', items: { $ref: '#/$defs/Node' } };
    if (manifest.children.min !== undefined) {
      properties.children.minItems = manifest.children.min;
    }
    if (manifest.children.max !== undefined) {
      properties.children.maxItems = manifest.children.max;
    }
  } else if (manifest.children?.kind === 'slots') {
    properties.slots = { type: 'object', additionalProperties: true };
  }

  mapEventsToActionList(properties, manifest.events);

  rewriteExprRefs({ properties });
  rebaseRefs({ properties });

  return {
    type: 'object',
    required: ['type', ...Array.from(required)],
    properties,
    additionalProperties: false,
  };
}

function buildContractSchema(manifests, perCompSchemas, actionDefs) {
  const nodeDefs = {};
  const nodeRefs = [];
  const harvestedDefs = {};

  for (let i = 0; i < manifests.length; i++) {
    const manifest = manifests[i];
    const key = `Node_${manifest.type}`;
    nodeDefs[key] = buildNodeDef(manifest, perCompSchemas[i]);
    nodeRefs.push({ $ref: `#/$defs/${key}` });

    const componentDefs = cloneDefs(perCompSchemas[i]);
    for (const [name, def] of Object.entries(componentDefs)) {
      if (actionDefs[name]) continue;
      rewriteExprRefs(def);
      rebaseRefs(def);
      harvestedDefs[name] = def;
    }
  }

  const schema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://bdui.dev/schema/contract.json',
    type: 'object',
    required: ['meta', 'navigation'],
    properties: {
      meta: {
        type: 'object',
        required: ['contractId', 'version', 'schemaVersion', 'generatedAt'],
        properties: {
          contractId: { type: 'string', minLength: 1 },
          version: { type: 'string', minLength: 1 },
          schemaVersion: { type: 'string', minLength: 1 },
          generatedAt: { type: 'string' },
          appId: { type: 'string' },
          signature: { type: 'string' },
          compatFrom: { type: 'string' },
          features: { type: 'object', additionalProperties: true },
        },
        additionalProperties: false,
      },
      theme: { type: 'object', additionalProperties: true },
      initial: {
        type: 'object',
        properties: {
          flow: { type: 'object', additionalProperties: true },
          session: { type: 'object', additionalProperties: true },
        },
        additionalProperties: false,
      },
      dataSources: { type: 'array', items: { $ref: '#/$defs/DataSource' } },
      navigation: {
        type: 'object',
        required: ['initialRoute', 'routes'],
        properties: {
          initialRoute: { type: 'string', minLength: 1 },
          urlSync: { type: 'boolean' },
          routes: {
            type: 'array',
            items: {
              oneOf: [{ $ref: '#/$defs/ScreenRoute' }, { $ref: '#/$defs/FlowRoute' }],
            },
          },
        },
        additionalProperties: false,
      },
    },
    additionalProperties: false,
    $defs: {
      Modifiers: { type: 'object', additionalProperties: true },
      Binding: {
        type: 'object',
        required: ['scope', 'path'],
        properties: {
          scope: { enum: ['local', 'session', 'flow'] },
          path: { type: 'string', minLength: 1 },
        },
        additionalProperties: false,
      },
      DataSource: {
        type: 'object',
        required: ['id', 'kind'],
        properties: {
          id: { type: 'string', minLength: 1 },
          kind: { type: 'string' },
          url: { type: 'string' },
          method: { type: 'string' },
          params: { type: 'object', additionalProperties: true },
        },
        additionalProperties: true,
      },
      ScreenRoute: {
        type: 'object',
        required: ['id', 'node'],
        properties: {
          id: { type: 'string', minLength: 1 },
          type: { const: 'screen' },
          title: { type: 'string' },
          path: { type: 'string' },
          cache: { type: 'object', additionalProperties: true },
          node: { $ref: '#/$defs/Node' },
        },
        additionalProperties: false,
      },
      FlowRoute: {
        type: 'object',
        required: ['id', 'type', 'startStep', 'steps'],
        properties: {
          id: { type: 'string', minLength: 1 },
          type: { const: 'flow' },
          title: { type: 'string' },
          startStep: { type: 'string', minLength: 1 },
          persistence: { type: 'object', additionalProperties: true },
          steps: { type: 'array', items: { $ref: '#/$defs/Step' } },
        },
        additionalProperties: false,
      },
      Step: {
        type: 'object',
        required: ['id', 'children'],
        properties: {
          id: { type: 'string', minLength: 1 },
          title: { type: 'string' },
          children: { type: 'array', items: { $ref: '#/$defs/Node' } },
          onEnter: { $ref: '#/$defs/ActionList' },
          onExit: { $ref: '#/$defs/ActionList' },
          onResume: { $ref: '#/$defs/ActionList' },
          transitions: {
            type: 'array',
            items: {
              type: 'object',
              required: ['to'],
              properties: {
                guard: {
                  oneOf: [{ type: 'string', pattern: EXPR_PATTERN }, { $ref: '#/$defs/ExprRef' }],
                },
                to: { type: 'string', minLength: 1 },
              },
              additionalProperties: false,
            },
          },
        },
        additionalProperties: false,
      },
      Node: {
        oneOf: nodeRefs,
      },
      ...harvestedDefs,
      ...nodeDefs,
      ...actionDefs,
    },
  };

  return schema;
}

module.exports = {
  createPropsSchemaLoader,
  createCoreTypeLoader,
  buildContractSchema,
  buildActionDefs,
};
