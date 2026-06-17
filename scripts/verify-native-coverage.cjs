#!/usr/bin/env node

const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const root = resolve(__dirname, '..');
const contracts = [
  ['Campus', resolve(root, 'examples', 'ops-control', 'contract.json')],
  ['Luma Market', resolve(root, 'examples', 'retail-commerce', 'contract.json')],
];

const actionTypes = new Set([
  'navigate',
  'back',
  'popToRoot',
  'replace',
  'set',
  'reset',
  'update.inc',
  'update.dec',
  'update.toggle',
  'update.append',
  'update.merge',
  'update.mapPath',
  'sync',
  'validate',
  'fetch',
  'call',
  'toast',
  'modal.open',
  'modal.close',
  'prefetchScreens',
  'batch',
  'when',
  'flow.start',
  'flow.advance',
  'flow.goTo',
  'flow.resume',
  'flow.abort',
  'flow.complete',
]);

const routeTypes = new Set(['flow']);

const nativeComponents = new Set([
  'Button',
  'Checkbox',
  'Column',
  'Divider',
  'If',
  'Image',
  'Input',
  'Row',
  'Select',
  'Text',
]);

const nativeActions = new Set([
  'navigate',
  'back',
  'popToRoot',
  'replace',
  'set',
  'reset',
  'update.inc',
  'update.dec',
  'update.toggle',
  'batch',
  'when',
  'toast',
  'flow.start',
  'flow.goTo',
  'flow.abort',
  'flow.complete',
  'call',
]);

function collectUsage(value, usedComponents, usedActions) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectUsage(item, usedComponents, usedActions);
    }
    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  const type = typeof value.type === 'string' ? value.type : undefined;
  if (type) {
    if (actionTypes.has(type)) {
      usedActions.add(type);
    } else if (routeTypes.has(type)) {
      // Route discriminants are handled by the native navigation layer.
    } else {
      usedComponents.add(type);
    }
  }

  for (const child of Object.values(value)) {
    collectUsage(child, usedComponents, usedActions);
  }
}

for (const [name, contractPath] of contracts) {
  const contract = JSON.parse(readFileSync(contractPath, 'utf8'));
  const usedComponents = new Set();
  const usedActions = new Set();

  collectUsage(contract.navigation, usedComponents, usedActions);

  const unsupportedComponents = [...usedComponents].filter((type) => !nativeComponents.has(type));
  const unsupportedActions = [...usedActions].filter((type) => !nativeActions.has(type));

  if (unsupportedComponents.length > 0 || unsupportedActions.length > 0) {
    const details = [
      unsupportedComponents.length > 0
        ? `unsupported native components: ${unsupportedComponents.join(', ')}`
        : undefined,
      unsupportedActions.length > 0
        ? `unsupported native actions: ${unsupportedActions.join(', ')}`
        : undefined,
    ]
      .filter(Boolean)
      .join('; ');
    throw new Error(`Native renderer prototypes do not cover the ${name} contract: ${details}`);
  }

  console.log(`${name} native component coverage: ${[...usedComponents].sort().join(', ')}`);
  console.log(`${name} native action coverage: ${[...usedActions].sort().join(', ')}`);
}
