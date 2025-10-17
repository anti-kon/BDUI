// AUTO-GENERATED. Do not edit.
export const contractSchema = {
  $id: 'https://bdui.dev/schema/contract.json',
  type: 'object',
  required: ['meta', 'navigation'],
  properties: {
    meta: {
      type: 'object',
      required: ['contractId', 'version', 'schemaVersion', 'generatedAt'],
      properties: {
        contractId: {
          type: 'string',
        },
        version: {
          type: 'string',
        },
        schemaVersion: {
          type: 'string',
        },
        signature: {
          type: 'string',
        },
      },
      additionalProperties: true,
    },
    theme: {
      type: 'object',
    },
    dataSources: {
      type: 'array',
    },
    navigation: {
      type: 'object',
      required: ['initialRoute', 'routes'],
      properties: {
        initialRoute: {
          type: 'string',
        },
        urlSync: {
          type: 'boolean',
        },
        routes: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'node'],
            properties: {
              id: {
                type: 'string',
              },
              title: {
                type: 'string',
              },
              path: {
                type: 'string',
              },
              cache: {
                type: 'object',
              },
              node: {
                $ref: '#/$defs/Node',
              },
            },
            additionalProperties: false,
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
        type: {
          enum: ['Text', 'Button', 'Row', 'Column'],
        },
        id: {
          type: 'string',
        },
        modifiers: {
          type: 'object',
        },
        children: {
          type: 'array',
          items: {
            $ref: '#/$defs/Node',
          },
        },
        onAction: {
          type: 'array',
        },
      },
      additionalProperties: true,
      allOf: [
        {
          if: {
            properties: {
              type: {
                const: 'Text',
              },
            },
          },
          then: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              modifiers: {
                type: 'object',
                additionalProperties: {},
              },
              text: {
                type: 'string',
              },
              type: {
                const: 'Text',
              },
            },
            required: ['type'],
            additionalProperties: true,
          },
        },
        {
          if: {
            properties: {
              type: {
                const: 'Button',
              },
            },
          },
          then: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              modifiers: {
                type: 'object',
                additionalProperties: {},
              },
              title: {
                type: 'string',
              },
              disabled: {
                type: 'boolean',
              },
              loading: {
                type: 'boolean',
              },
              onAction: {
                type: 'array',
              },
              type: {
                const: 'Button',
              },
            },
            required: ['type', 'title'],
            additionalProperties: true,
          },
        },
        {
          if: {
            properties: {
              type: {
                const: 'Row',
              },
            },
          },
          then: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              modifiers: {
                type: 'object',
                additionalProperties: {},
              },
              children: {
                type: 'array',
                items: {
                  $ref: '#/$defs/Node',
                },
              },
              type: {
                const: 'Row',
              },
            },
            required: ['type'],
            additionalProperties: true,
          },
        },
        {
          if: {
            properties: {
              type: {
                const: 'Column',
              },
            },
          },
          then: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              modifiers: {
                type: 'object',
                additionalProperties: {},
              },
              children: {
                type: 'array',
                items: {
                  $ref: '#/$defs/Node',
                },
              },
              type: {
                const: 'Column',
              },
            },
            required: ['type'],
            additionalProperties: true,
          },
        },
      ],
    },
  },
  additionalProperties: false,
} as const;
