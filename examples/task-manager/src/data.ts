import type { DataSource } from '@bdui/core';

export const apiBase = '/api';

export const dataSources: readonly DataSource[] = [
  {
    id: 'workspaceSnapshot',
    kind: 'rest',
    url: `${apiBase}/workspace?plan={{session.plan}}`,
    method: 'GET',
    headers: { accept: 'application/json' },
  },
  {
    id: 'starterCatalog',
    kind: 'static',
    value: {
      templateName: 'Шаблон готовности запуска',
      sections: 7,
      guardrails: 'Данные, право, бренд, откат',
      defaultOwner: 'Операции',
    },
  },
];
