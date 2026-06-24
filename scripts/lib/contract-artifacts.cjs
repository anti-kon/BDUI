'use strict';

/**
 * Single source of truth for the tracked contract/asset artifacts shared by
 * `build-contract-artifacts.cjs` (which generates and mirrors them) and
 * `verify-contract-artifacts.cjs` (which validates and checks they stay in
 * sync). Keeping the path lists here avoids the two scripts drifting apart.
 */

// TSX entry -> canonical contract output.
const CONTRACT_SOURCES = [
  ['sandbox/counter/src/entry.tsx', 'sandbox/counter/contract.json'],
  ['sandbox/state/src/entry.tsx', 'sandbox/state/contract.json'],
  ['sandbox/flow/src/entry.tsx', 'sandbox/flow/contract.json'],
  ['sandbox/full-app/src/entry.tsx', 'sandbox/full-app/contract.json'],
  ['examples/task-manager/src/app.tsx', 'examples/task-manager/public/contract.json'],
  ['examples/ops-control/src/app.tsx', 'examples/ops-control/contract.json'],
  ['examples/retail-commerce/src/app.tsx', 'examples/retail-commerce/contract.json'],
];

// Canonical contract that is mirrored verbatim into the demo and native apps.
const CAMPUS = {
  source: 'examples/ops-control/contract.json',
  copies: [
    'sandbox/web-demo/contract.json',
    'native/android/app/src/main/assets/campus.contract.json',
    'native/ios/OpsControl/Resources/campus.contract.json',
  ],
};

const RETAIL = {
  source: 'examples/retail-commerce/contract.json',
  copies: [
    'sandbox/web-demo/retail.contract.json',
    'native/android/app/src/main/assets/retail.contract.json',
    'native/ios/OpsControl/Resources/retail.contract.json',
  ],
};

// Campus brand assets mirrored into the web demo only.
const CAMPUS_ASSET_COPIES = [
  ['examples/ops-control/public/campus-mark.svg', 'sandbox/web-demo/campus-mark.svg'],
];

// Retail assets are mirrored from the example's public dir into each of these
// roots under the same relative name.
const RETAIL_PUBLIC_DIR = 'examples/retail-commerce/public';
const RETAIL_ASSET_ROOTS = [
  'sandbox/web-demo',
  'native/android/app/src/main/assets',
  'native/ios/OpsControl/Resources',
];
const RETAIL_ASSET_NAMES = [
  'market-mark.svg',
  'market-mark.png',
  'products/espresso-machine.png',
  'products/desk-chair.png',
  'products/desk-lamp.png',
  'products/robot-vacuum.png',
  'products/air-humidifier.png',
  'products/laptop-backpack.png',
];

/** Retail assets grouped as `[source, [copies]]` (used by the verifier). */
function retailAssetGroups() {
  return RETAIL_ASSET_NAMES.map((name) => [
    `${RETAIL_PUBLIC_DIR}/${name}`,
    RETAIL_ASSET_ROOTS.map((rootDir) => `${rootDir}/${name}`),
  ]);
}

/** Retail assets flattened to `[source, copy]` pairs (used by the builder). */
function retailAssetPairs() {
  return retailAssetGroups().flatMap(([source, copies]) => copies.map((copy) => [source, copy]));
}

/** Every contract file the verifier validates: canonical outputs plus copies. */
function allContractFiles() {
  return [...CONTRACT_SOURCES.map(([, out]) => out), ...CAMPUS.copies, ...RETAIL.copies];
}

module.exports = {
  CONTRACT_SOURCES,
  CAMPUS,
  RETAIL,
  CAMPUS_ASSET_COPIES,
  retailAssetGroups,
  retailAssetPairs,
  allContractFiles,
};
