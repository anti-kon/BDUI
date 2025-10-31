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
    initial: {
      type: 'object',
      properties: {
        flow: {
          type: 'object',
          additionalProperties: true,
        },
        session: {
          type: 'object',
          additionalProperties: true,
        },
      },
      additionalProperties: false,
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
            oneOf: [
              {
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
              {
                type: 'object',
                required: ['id', 'type', 'startStep', 'steps'],
                properties: {
                  id: {
                    type: 'string',
                  },
                  type: {
                    const: 'flow',
                  },
                  title: {
                    type: 'string',
                  },
                  startStep: {
                    type: 'string',
                  },
                  persistence: {
                    type: 'object',
                    additionalProperties: true,
                  },
                  steps: {
                    type: 'array',
                    items: {
                      $ref: '#/$defs/Step',
                    },
                  },
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
        type: {
          enum: ['Button', 'Column', 'Row', 'Text'],
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
              text: {},
              type: {
                const: 'Text',
              },
            },
            required: ['type'],
            additionalProperties: true,
          },
        },
      ],
    },
    Step: {
      type: 'object',
      required: ['id', 'children'],
      properties: {
        id: {
          type: 'string',
        },
        title: {
          type: 'string',
        },
        children: {
          type: 'array',
          items: {
            $ref: '#/$defs/Node',
          },
        },
        onEnter: {
          type: 'array',
          items: {
            type: 'object',
          },
        },
        onExit: {
          type: 'array',
          items: {
            type: 'object',
          },
        },
        onResume: {
          type: 'array',
          items: {
            type: 'object',
          },
        },
        transitions: {
          type: 'array',
          items: {
            type: 'object',
            required: ['to'],
            properties: {
              guard: {
                type: 'string',
              },
              to: {
                type: 'string',
              },
            },
            additionalProperties: false,
          },
        },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
} as const;
