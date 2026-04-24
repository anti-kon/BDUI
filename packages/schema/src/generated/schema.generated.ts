// AUTO-GENERATED. Do not edit.
export const contractSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
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
          minLength: 1,
        },
        version: {
          type: 'string',
          minLength: 1,
        },
        schemaVersion: {
          type: 'string',
          minLength: 1,
        },
        generatedAt: {
          type: 'string',
        },
        appId: {
          type: 'string',
        },
        signature: {
          type: 'string',
        },
        compatFrom: {
          type: 'string',
        },
        features: {
          type: 'object',
          additionalProperties: true,
        },
      },
      additionalProperties: false,
    },
    theme: {
      type: 'object',
      additionalProperties: true,
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
      items: {
        $ref: '#/$defs/DataSource',
      },
    },
    navigation: {
      type: 'object',
      required: ['initialRoute', 'routes'],
      properties: {
        initialRoute: {
          type: 'string',
          minLength: 1,
        },
        urlSync: {
          type: 'boolean',
        },
        routes: {
          type: 'array',
          items: {
            oneOf: [
              {
                $ref: '#/$defs/ScreenRoute',
              },
              {
                $ref: '#/$defs/FlowRoute',
              },
            ],
          },
        },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
  $defs: {
    Modifiers: {
      type: 'object',
      additionalProperties: true,
    },
    Binding: {
      type: 'object',
      properties: {
        scope: {
          $ref: '#/$defs/Scope',
        },
        path: {
          type: 'string',
        },
      },
      required: ['scope', 'path'],
      additionalProperties: false,
    },
    DataSource: {
      type: 'object',
      required: ['id', 'kind'],
      properties: {
        id: {
          type: 'string',
          minLength: 1,
        },
        kind: {
          type: 'string',
        },
        url: {
          type: 'string',
        },
        method: {
          type: 'string',
        },
        params: {
          type: 'object',
          additionalProperties: true,
        },
      },
      additionalProperties: true,
    },
    ScreenRoute: {
      type: 'object',
      required: ['id', 'node'],
      properties: {
        id: {
          type: 'string',
          minLength: 1,
        },
        type: {
          const: 'screen',
        },
        title: {
          type: 'string',
        },
        path: {
          type: 'string',
        },
        cache: {
          type: 'object',
          additionalProperties: true,
        },
        node: {
          $ref: '#/$defs/Node',
        },
      },
      additionalProperties: false,
    },
    FlowRoute: {
      type: 'object',
      required: ['id', 'type', 'startStep', 'steps'],
      properties: {
        id: {
          type: 'string',
          minLength: 1,
        },
        type: {
          const: 'flow',
        },
        title: {
          type: 'string',
        },
        startStep: {
          type: 'string',
          minLength: 1,
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
    Step: {
      type: 'object',
      required: ['id', 'children'],
      properties: {
        id: {
          type: 'string',
          minLength: 1,
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
          $ref: '#/$defs/ActionList',
        },
        onExit: {
          $ref: '#/$defs/ActionList',
        },
        onResume: {
          $ref: '#/$defs/ActionList',
        },
        transitions: {
          type: 'array',
          items: {
            type: 'object',
            required: ['to'],
            properties: {
              guard: {
                oneOf: [
                  {
                    type: 'string',
                    pattern: '^\\{\\{[\\s\\S]+\\}\\}$',
                  },
                  {
                    $ref: '#/$defs/ExprRef',
                  },
                ],
              },
              to: {
                type: 'string',
                minLength: 1,
              },
            },
            additionalProperties: false,
          },
        },
      },
      additionalProperties: false,
    },
    Node: {
      oneOf: [
        {
          $ref: '#/$defs/Node_Button',
        },
        {
          $ref: '#/$defs/Node_Checkbox',
        },
        {
          $ref: '#/$defs/Node_Column',
        },
        {
          $ref: '#/$defs/Node_Divider',
        },
        {
          $ref: '#/$defs/Node_If',
        },
        {
          $ref: '#/$defs/Node_Image',
        },
        {
          $ref: '#/$defs/Node_Input',
        },
        {
          $ref: '#/$defs/Node_Row',
        },
        {
          $ref: '#/$defs/Node_Select',
        },
        {
          $ref: '#/$defs/Node_Text',
        },
      ],
    },
    InputType: {
      type: 'string',
      enum: ['text', 'number', 'email', 'password', 'tel', 'url'],
    },
    SelectOption: {
      type: 'object',
      properties: {
        value: {
          type: ['string', 'number'],
        },
        label: {
          type: 'string',
        },
        disabled: {
          type: 'boolean',
        },
      },
      required: ['value', 'label'],
      additionalProperties: false,
    },
    Node_Button: {
      type: 'object',
      required: ['type', 'title'],
      properties: {
        title: {
          type: 'string',
        },
        disabled: {
          type: 'boolean',
        },
        loading: {
          type: 'boolean',
        },
        variant: {
          type: 'string',
          enum: ['primary', 'secondary'],
        },
        onAction: {
          $ref: '#/$defs/ActionList',
        },
        type: {
          const: 'Button',
        },
        id: {
          type: 'string',
        },
        modifiers: {
          $ref: '#/$defs/Modifiers',
        },
      },
      additionalProperties: false,
    },
    Node_Checkbox: {
      type: 'object',
      required: ['type', 'binding'],
      properties: {
        binding: {
          $ref: '#/$defs/Binding',
        },
        label: {
          type: 'string',
        },
        disabled: {
          type: 'boolean',
        },
        onChangeAction: {
          $ref: '#/$defs/ActionList',
        },
        type: {
          const: 'Checkbox',
        },
        id: {
          type: 'string',
        },
        modifiers: {
          $ref: '#/$defs/Modifiers',
        },
      },
      additionalProperties: false,
    },
    Node_Column: {
      type: 'object',
      required: ['type'],
      properties: {
        align: {
          type: 'string',
          enum: ['start', 'center', 'end', 'stretch'],
        },
        justify: {
          type: 'string',
          enum: ['start', 'center', 'end', 'between', 'around'],
        },
        gap: {
          type: ['number', 'string'],
        },
        type: {
          const: 'Column',
        },
        id: {
          type: 'string',
        },
        modifiers: {
          $ref: '#/$defs/Modifiers',
        },
        children: {
          type: 'array',
          items: {
            $ref: '#/$defs/Node',
          },
        },
      },
      additionalProperties: false,
    },
    Node_Divider: {
      type: 'object',
      required: ['type'],
      properties: {
        orientation: {
          type: 'string',
          enum: ['horizontal', 'vertical'],
        },
        thickness: {
          type: 'number',
        },
        color: {
          type: 'string',
        },
        type: {
          const: 'Divider',
        },
        id: {
          type: 'string',
        },
        modifiers: {
          $ref: '#/$defs/Modifiers',
        },
      },
      additionalProperties: false,
    },
    Node_If: {
      type: 'object',
      required: ['type', 'condition'],
      properties: {
        condition: {},
        type: {
          const: 'If',
        },
        id: {
          type: 'string',
        },
        modifiers: {
          $ref: '#/$defs/Modifiers',
        },
        children: {
          type: 'array',
          items: {
            $ref: '#/$defs/Node',
          },
        },
      },
      additionalProperties: false,
    },
    Node_Image: {
      type: 'object',
      required: ['type', 'src'],
      properties: {
        src: {
          type: 'string',
        },
        alt: {
          type: 'string',
        },
        width: {
          type: ['number', 'string'],
        },
        height: {
          type: ['number', 'string'],
        },
        loading: {
          type: 'string',
          enum: ['eager', 'lazy'],
        },
        fit: {
          type: 'string',
          enum: ['contain', 'cover', 'fill', 'none', 'scale-down'],
        },
        type: {
          const: 'Image',
        },
        id: {
          type: 'string',
        },
        modifiers: {
          $ref: '#/$defs/Modifiers',
        },
      },
      additionalProperties: false,
    },
    Node_Input: {
      type: 'object',
      required: ['type', 'binding'],
      properties: {
        binding: {
          $ref: '#/$defs/Binding',
        },
        placeholder: {
          type: 'string',
        },
        inputType: {
          $ref: '#/$defs/InputType',
        },
        disabled: {
          type: 'boolean',
        },
        readOnly: {
          type: 'boolean',
        },
        autoComplete: {
          type: 'string',
        },
        maxLength: {
          type: 'number',
        },
        onChangeAction: {
          $ref: '#/$defs/ActionList',
        },
        onBlurAction: {
          $ref: '#/$defs/ActionList',
        },
        type: {
          const: 'Input',
        },
        id: {
          type: 'string',
        },
        modifiers: {
          $ref: '#/$defs/Modifiers',
        },
      },
      additionalProperties: false,
    },
    Node_Row: {
      type: 'object',
      required: ['type'],
      properties: {
        align: {
          type: 'string',
          enum: ['start', 'center', 'end', 'stretch'],
        },
        justify: {
          type: 'string',
          enum: ['start', 'center', 'end', 'between', 'around'],
        },
        gap: {
          type: ['number', 'string'],
        },
        wrap: {
          type: 'boolean',
        },
        type: {
          const: 'Row',
        },
        id: {
          type: 'string',
        },
        modifiers: {
          $ref: '#/$defs/Modifiers',
        },
        children: {
          type: 'array',
          items: {
            $ref: '#/$defs/Node',
          },
        },
      },
      additionalProperties: false,
    },
    Node_Select: {
      type: 'object',
      required: ['type', 'binding', 'options'],
      properties: {
        binding: {
          $ref: '#/$defs/Binding',
        },
        options: {
          type: 'array',
          items: {
            $ref: '#/$defs/SelectOption',
          },
        },
        placeholder: {
          type: 'string',
        },
        disabled: {
          type: 'boolean',
        },
        onChangeAction: {
          $ref: '#/$defs/ActionList',
        },
        type: {
          const: 'Select',
        },
        id: {
          type: 'string',
        },
        modifiers: {
          $ref: '#/$defs/Modifiers',
        },
      },
      additionalProperties: false,
    },
    Node_Text: {
      type: 'object',
      required: ['type'],
      properties: {
        text: {},
        type: {
          const: 'Text',
        },
        id: {
          type: 'string',
        },
        modifiers: {
          $ref: '#/$defs/Modifiers',
        },
      },
      additionalProperties: false,
    },
    NavigateAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'navigate',
        },
        params: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
            },
            mode: {
              $ref: '#/$defs/NavigateMode',
            },
            params: {
              type: 'object',
              additionalProperties: {},
            },
          },
          required: ['to'],
        },
      },
      required: ['type', 'params'],
    },
    NavigateMode: {
      type: 'string',
      enum: ['push', 'replace', 'popToRoot'],
    },
    BackAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'back',
        },
      },
      required: ['type'],
    },
    PopToRootAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'popToRoot',
        },
      },
      required: ['type'],
    },
    ReplaceAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'replace',
        },
        params: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
            },
          },
          required: ['to'],
        },
      },
      required: ['type', 'params'],
    },
    SetAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'set',
        },
        params: {
          type: 'object',
          properties: {
            target: {
              $ref: '#/$defs/StateTarget',
            },
            value: {},
          },
          required: ['target', 'value'],
        },
      },
      required: ['type', 'params'],
    },
    StateTarget: {
      type: 'object',
      properties: {
        scope: {
          $ref: '#/$defs/Scope',
        },
        path: {
          type: 'string',
        },
      },
      required: ['scope', 'path'],
    },
    Scope: {
      type: 'string',
      enum: ['local', 'session', 'flow'],
    },
    ResetAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'reset',
        },
        params: {
          type: 'object',
          properties: {
            target: {
              $ref: '#/$defs/StateTarget',
            },
            value: {},
          },
          required: ['target'],
        },
      },
      required: ['type', 'params'],
    },
    UpdateIncAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'update.inc',
        },
        params: {
          type: 'object',
          properties: {
            target: {
              $ref: '#/$defs/StateTarget',
            },
            by: {
              $ref: '#/$defs/Expression%3Cnumber%3E',
            },
          },
          required: ['target'],
        },
      },
      required: ['type', 'params'],
    },
    'Expression<number>': {
      anyOf: [
        {
          type: 'number',
        },
        {
          oneOf: [
            {
              type: 'string',
              pattern: '^\\{\\{[\\s\\S]+\\}\\}$',
            },
            {
              $ref: '#/$defs/ExprRef',
            },
          ],
        },
      ],
    },
    ExprRef: {
      type: 'object',
      required: ['__bduiExpr', 'code'],
      properties: {
        __bduiExpr: {
          const: true,
        },
        code: {
          type: 'string',
          minLength: 1,
        },
      },
      additionalProperties: false,
    },
    UpdateDecAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'update.dec',
        },
        params: {
          type: 'object',
          properties: {
            target: {
              $ref: '#/$defs/StateTarget',
            },
            by: {
              $ref: '#/$defs/Expression%3Cnumber%3E',
            },
          },
          required: ['target'],
        },
      },
      required: ['type', 'params'],
    },
    UpdateToggleAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'update.toggle',
        },
        params: {
          type: 'object',
          properties: {
            target: {
              $ref: '#/$defs/StateTarget',
            },
          },
          required: ['target'],
        },
      },
      required: ['type', 'params'],
    },
    UpdateAppendAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'update.append',
        },
        params: {
          type: 'object',
          properties: {
            target: {
              $ref: '#/$defs/StateTarget',
            },
            value: {},
          },
          required: ['target', 'value'],
        },
      },
      required: ['type', 'params'],
    },
    UpdateMergeAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'update.merge',
        },
        params: {
          type: 'object',
          properties: {
            target: {
              $ref: '#/$defs/StateTarget',
            },
            value: {
              anyOf: [
                {
                  type: 'object',
                  additionalProperties: {},
                },
                {
                  oneOf: [
                    {
                      type: 'string',
                      pattern: '^\\{\\{[\\s\\S]+\\}\\}$',
                    },
                    {
                      $ref: '#/$defs/ExprRef',
                    },
                  ],
                },
              ],
            },
          },
          required: ['target', 'value'],
        },
      },
      required: ['type', 'params'],
    },
    UpdateMapPathAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'update.mapPath',
        },
        params: {
          type: 'object',
          properties: {
            target: {
              $ref: '#/$defs/StateTarget',
            },
            pick: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            rename: {
              type: 'object',
              additionalProperties: {
                type: 'string',
              },
            },
            defaults: {
              type: 'object',
              additionalProperties: {},
            },
          },
          required: ['target'],
        },
      },
      required: ['type', 'params'],
    },
    SyncAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'sync',
        },
        params: {
          type: 'object',
          additionalProperties: {},
        },
      },
      required: ['type'],
    },
    ValidateAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'validate',
        },
        params: {
          type: 'object',
          properties: {
            schemaRef: {
              type: 'string',
            },
            target: {
              $ref: '#/$defs/StateTarget',
            },
          },
          required: ['schemaRef', 'target'],
        },
      },
      required: ['type', 'params'],
    },
    FetchAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'fetch',
        },
        params: {
          type: 'object',
          properties: {
            sourceId: {
              type: 'string',
            },
            params: {
              type: 'object',
              additionalProperties: {},
            },
            saveTo: {
              $ref: '#/$defs/StateTarget',
            },
          },
          required: ['sourceId'],
        },
      },
      required: ['type', 'params'],
    },
    CallAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'call',
        },
        params: {
          type: 'object',
          properties: {
            url: {
              $ref: '#/$defs/Expression%3Cstring%3E',
            },
            method: {
              $ref: '#/$defs/HttpMethod',
            },
            headers: {
              type: 'object',
              additionalProperties: {
                type: 'string',
              },
            },
            body: {},
            saveTo: {
              $ref: '#/$defs/StateTarget',
            },
            timeoutMs: {
              type: 'number',
            },
          },
          required: ['url', 'method'],
        },
        rollbackAction: {
          $ref: '#/$defs/Action',
        },
      },
      required: ['type', 'params'],
    },
    'Expression<string>': {
      anyOf: [
        {
          type: 'string',
        },
        {
          oneOf: [
            {
              type: 'string',
              pattern: '^\\{\\{[\\s\\S]+\\}\\}$',
            },
            {
              $ref: '#/$defs/ExprRef',
            },
          ],
        },
      ],
    },
    HttpMethod: {
      type: 'string',
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
    Action: {
      anyOf: [
        {
          $ref: '#/$defs/NavigateAction',
        },
        {
          $ref: '#/$defs/BackAction',
        },
        {
          $ref: '#/$defs/PopToRootAction',
        },
        {
          $ref: '#/$defs/ReplaceAction',
        },
        {
          $ref: '#/$defs/SetAction',
        },
        {
          $ref: '#/$defs/ResetAction',
        },
        {
          $ref: '#/$defs/UpdateIncAction',
        },
        {
          $ref: '#/$defs/UpdateDecAction',
        },
        {
          $ref: '#/$defs/UpdateToggleAction',
        },
        {
          $ref: '#/$defs/UpdateAppendAction',
        },
        {
          $ref: '#/$defs/UpdateMergeAction',
        },
        {
          $ref: '#/$defs/UpdateMapPathAction',
        },
        {
          $ref: '#/$defs/SyncAction',
        },
        {
          $ref: '#/$defs/ValidateAction',
        },
        {
          $ref: '#/$defs/FetchAction',
        },
        {
          $ref: '#/$defs/CallAction',
        },
        {
          $ref: '#/$defs/ToastAction',
        },
        {
          $ref: '#/$defs/ModalOpenAction',
        },
        {
          $ref: '#/$defs/ModalCloseAction',
        },
        {
          $ref: '#/$defs/PrefetchScreensAction',
        },
        {
          $ref: '#/$defs/BatchAction',
        },
        {
          $ref: '#/$defs/WhenAction',
        },
        {
          $ref: '#/$defs/FlowStartAction',
        },
        {
          $ref: '#/$defs/FlowAdvanceAction',
        },
        {
          $ref: '#/$defs/FlowGoToAction',
        },
        {
          $ref: '#/$defs/FlowResumeAction',
        },
        {
          $ref: '#/$defs/FlowAbortAction',
        },
        {
          $ref: '#/$defs/FlowCompleteAction',
        },
      ],
    },
    ToastAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'toast',
        },
        params: {
          type: 'object',
          properties: {
            message: {
              $ref: '#/$defs/Expression%3Cstring%3E',
            },
            level: {
              $ref: '#/$defs/ToastLevel',
            },
            durationMs: {
              type: 'number',
            },
          },
          required: ['message'],
        },
      },
      required: ['type', 'params'],
    },
    ToastLevel: {
      type: 'string',
      enum: ['info', 'success', 'warning', 'error'],
    },
    ModalOpenAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'modal.open',
        },
        params: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
          },
          required: ['id'],
        },
      },
      required: ['type', 'params'],
    },
    ModalCloseAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'modal.close',
        },
        params: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
          },
          required: ['id'],
        },
      },
      required: ['type', 'params'],
    },
    PrefetchScreensAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'prefetchScreens',
        },
        params: {
          type: 'object',
          properties: {
            screens: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
          required: ['screens'],
        },
      },
      required: ['type', 'params'],
    },
    BatchAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'batch',
        },
        params: {
          type: 'object',
          properties: {
            actions: {
              type: 'array',
              items: {
                $ref: '#/$defs/Action',
              },
            },
            atomic: {
              type: 'boolean',
            },
          },
          required: ['actions'],
        },
      },
      required: ['type', 'params'],
    },
    WhenAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'when',
        },
        params: {
          type: 'object',
          properties: {
            if: {
              oneOf: [
                {
                  type: 'string',
                  pattern: '^\\{\\{[\\s\\S]+\\}\\}$',
                },
                {
                  $ref: '#/$defs/ExprRef',
                },
              ],
            },
            then: {
              type: 'array',
              items: {
                $ref: '#/$defs/Action',
              },
            },
            else: {
              type: 'array',
              items: {
                $ref: '#/$defs/Action',
              },
            },
          },
          required: ['if', 'then'],
        },
      },
      required: ['type', 'params'],
    },
    FlowStartAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'flow.start',
        },
        params: {
          type: 'object',
          properties: {
            routeId: {
              type: 'string',
            },
            params: {
              type: 'object',
              additionalProperties: {},
            },
          },
          required: ['routeId'],
        },
      },
      required: ['type', 'params'],
    },
    FlowAdvanceAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'flow.advance',
        },
        params: {
          type: 'object',
          properties: {
            routeId: {
              type: 'string',
            },
          },
        },
      },
      required: ['type'],
    },
    FlowGoToAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'flow.goTo',
        },
        params: {
          type: 'object',
          properties: {
            routeId: {
              type: 'string',
            },
            stepId: {
              type: 'string',
            },
          },
          required: ['stepId'],
        },
      },
      required: ['type', 'params'],
    },
    FlowResumeAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'flow.resume',
        },
        params: {
          type: 'object',
          properties: {
            routeId: {
              type: 'string',
            },
          },
        },
      },
      required: ['type'],
    },
    FlowAbortAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'flow.abort',
        },
        params: {
          type: 'object',
          properties: {
            routeId: {
              type: 'string',
            },
            reason: {
              type: 'string',
            },
          },
        },
      },
      required: ['type'],
    },
    FlowCompleteAction: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'flow.complete',
        },
        params: {
          type: 'object',
          properties: {
            routeId: {
              type: 'string',
            },
          },
        },
      },
      required: ['type'],
    },
    ActionList: {
      type: 'array',
      items: {
        $ref: '#/$defs/Action',
      },
    },
  },
} as const;
