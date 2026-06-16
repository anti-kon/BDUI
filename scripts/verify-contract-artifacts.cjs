#!/usr/bin/env node

const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const root = resolve(__dirname, '..');
const cli = resolve(root, 'packages', 'cli', 'dist', 'bin.js');

const contracts = [
  'sandbox/counter/contract.json',
  'sandbox/state/contract.json',
  'sandbox/flow/contract.json',
  'sandbox/full-app/contract.json',
  'sandbox/web-demo/contract.json',
  'sandbox/web-demo/retail.contract.json',
  'examples/task-manager/public/contract.json',
  'examples/ops-control/contract.json',
  'examples/retail-commerce/contract.json',
  'native/android/app/src/main/assets/campus.contract.json',
  'native/ios/OpsControl/Resources/campus.contract.json',
];

const sharedCampusContract = 'examples/ops-control/contract.json';
const sharedCopies = [
  'sandbox/web-demo/contract.json',
  'native/android/app/src/main/assets/campus.contract.json',
  'native/ios/OpsControl/Resources/campus.contract.json',
];
const sharedRetailContract = 'examples/retail-commerce/contract.json';
const sharedRetailCopies = ['sandbox/web-demo/retail.contract.json'];
const sharedRetailAssets = [
  ['examples/retail-commerce/public/market-mark.svg', ['sandbox/web-demo/market-mark.svg']],
  [
    'examples/retail-commerce/public/products/espresso-machine.png',
    ['sandbox/web-demo/products/espresso-machine.png'],
  ],
  [
    'examples/retail-commerce/public/products/desk-chair.png',
    ['sandbox/web-demo/products/desk-chair.png'],
  ],
  [
    'examples/retail-commerce/public/products/desk-lamp.png',
    ['sandbox/web-demo/products/desk-lamp.png'],
  ],
  [
    'examples/retail-commerce/public/products/robot-vacuum.png',
    ['sandbox/web-demo/products/robot-vacuum.png'],
  ],
  [
    'examples/retail-commerce/public/products/air-humidifier.png',
    ['sandbox/web-demo/products/air-humidifier.png'],
  ],
  [
    'examples/retail-commerce/public/products/laptop-backpack.png',
    ['sandbox/web-demo/products/laptop-backpack.png'],
  ],
];

function readJsonFile(relativePath) {
  return readFileSync(resolve(root, relativePath), 'utf8').replace(/\r\n/g, '\n');
}

function readBinaryFile(relativePath) {
  return readFileSync(resolve(root, relativePath));
}

function runValidation(relativePath) {
  execFileSync(process.execPath, [cli, 'validate', relativePath], {
    cwd: root,
    stdio: 'inherit',
  });
}

for (const contract of contracts) {
  runValidation(contract);
}

const canonicalCampus = readJsonFile(sharedCampusContract);
for (const copy of sharedCopies) {
  const copyContent = readJsonFile(copy);
  if (copyContent !== canonicalCampus) {
    throw new Error(`${copy} is out of sync with ${sharedCampusContract}`);
  }
}

const canonicalRetail = readJsonFile(sharedRetailContract);
for (const copy of sharedRetailCopies) {
  const copyContent = readJsonFile(copy);
  if (copyContent !== canonicalRetail) {
    throw new Error(`${copy} is out of sync with ${sharedRetailContract}`);
  }
}

for (const [source, copies] of sharedRetailAssets) {
  const canonicalAsset = readBinaryFile(source);
  for (const copy of copies) {
    if (!readBinaryFile(copy).equals(canonicalAsset)) {
      throw new Error(`${copy} is out of sync with ${source}`);
    }
  }
}

console.log('All BDUI contract artifacts are valid and synchronized.');
