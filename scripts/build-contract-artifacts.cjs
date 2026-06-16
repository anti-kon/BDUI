#!/usr/bin/env node

const { copyFileSync, mkdirSync, writeFileSync } = require('node:fs');
const { dirname, resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

const root = resolve(__dirname, '..');

const contractArtifacts = [
  ['sandbox/counter/src/entry.tsx', 'sandbox/counter/contract.json'],
  ['sandbox/state/src/entry.tsx', 'sandbox/state/contract.json'],
  ['sandbox/flow/src/entry.tsx', 'sandbox/flow/contract.json'],
  ['sandbox/full-app/src/entry.tsx', 'sandbox/full-app/contract.json'],
  ['examples/task-manager/src/app.tsx', 'examples/task-manager/public/contract.json'],
  ['examples/ops-control/src/app.tsx', 'examples/ops-control/contract.json'],
  ['examples/retail-commerce/src/app.tsx', 'examples/retail-commerce/contract.json'],
];

const campusSource = 'examples/ops-control/contract.json';
const campusCopies = [
  'sandbox/web-demo/contract.json',
  'native/android/app/src/main/assets/campus.contract.json',
  'native/ios/OpsControl/Resources/campus.contract.json',
];

const campusAssetCopies = [
  ['examples/ops-control/public/campus-mark.svg', 'sandbox/web-demo/campus-mark.svg'],
];

const retailSource = 'examples/retail-commerce/contract.json';
const retailCopies = ['sandbox/web-demo/retail.contract.json'];

const retailAssetCopies = [
  ['examples/retail-commerce/public/market-mark.svg', 'sandbox/web-demo/market-mark.svg'],
  [
    'examples/retail-commerce/public/products/espresso-machine.png',
    'sandbox/web-demo/products/espresso-machine.png',
  ],
  [
    'examples/retail-commerce/public/products/desk-chair.png',
    'sandbox/web-demo/products/desk-chair.png',
  ],
  [
    'examples/retail-commerce/public/products/desk-lamp.png',
    'sandbox/web-demo/products/desk-lamp.png',
  ],
  [
    'examples/retail-commerce/public/products/robot-vacuum.png',
    'sandbox/web-demo/products/robot-vacuum.png',
  ],
  [
    'examples/retail-commerce/public/products/air-humidifier.png',
    'sandbox/web-demo/products/air-humidifier.png',
  ],
  [
    'examples/retail-commerce/public/products/laptop-backpack.png',
    'sandbox/web-demo/products/laptop-backpack.png',
  ],
];

async function main() {
  const transpilerUrl = pathToFileURL(
    resolve(root, 'packages', 'transpiler', 'dist', 'index.js'),
  ).href;
  const { buildContract } = await import(transpilerUrl);

  for (const [entry, outFile] of contractArtifacts) {
    const { json } = await buildContract({
      entry: resolve(root, entry),
      mode: 'prod',
    });
    writeFileSync(resolve(root, outFile), `${json}\n`);
    console.log(`built ${outFile}`);
  }

  for (const copy of campusCopies) {
    copyFileSync(resolve(root, campusSource), resolve(root, copy));
    console.log(`synced ${copy}`);
  }

  for (const copy of retailCopies) {
    copyFileSync(resolve(root, retailSource), resolve(root, copy));
    console.log(`synced ${copy}`);
  }

  for (const [source, copy] of campusAssetCopies) {
    const target = resolve(root, copy);
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(resolve(root, source), target);
    console.log(`synced ${copy}`);
  }

  for (const [source, copy] of retailAssetCopies) {
    const target = resolve(root, copy);
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(resolve(root, source), target);
    console.log(`synced ${copy}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
