import { describe, expect, it } from 'vitest';

import { Contract } from '../builders/contract.js';
import { Navigation } from '../builders/navigation.js';
import { Route } from '../builders/route.js';

const meta = {
  contractId: 'com.example.contract',
  version: '1.0.0',
};

describe('Contract builder', () => {
  it('includes declared data sources', () => {
    const contract = Contract({
      meta,
      dataSources: [
        {
          id: 'workspace',
          kind: 'rest',
          url: '/api/workspace',
          method: 'GET',
        },
      ],
      children: Navigation({
        initialRoute: 'home',
        children: Route({
          id: 'home',
          children: { type: 'Text', text: 'Hello' },
        }),
      }),
    });

    expect(contract.dataSources).toEqual([
      {
        id: 'workspace',
        kind: 'rest',
        url: '/api/workspace',
        method: 'GET',
      },
    ]);
  });

  it('omits empty data source lists', () => {
    const contract = Contract({
      meta,
      dataSources: [],
      children: Navigation({
        initialRoute: 'home',
        children: Route({
          id: 'home',
          children: { type: 'Text', text: 'Hello' },
        }),
      }),
    });

    expect(contract.dataSources).toBeUndefined();
  });
});
