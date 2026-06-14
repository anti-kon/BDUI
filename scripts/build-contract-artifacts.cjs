#!/usr/bin/env node

const { copyFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

const root = resolve(__dirname, '..');

const contractArtifacts = [
  ['sandbox/counter/src/entry.tsx', 'sandbox/counter/contract.json'],
  ['sandbox/state/src/entry.tsx', 'sandbox/state/contract.json'],
  ['sandbox/flow/src/entry.tsx', 'sandbox/flow/contract.json'],
  ['sandbox/full-app/src/entry.tsx', 'sandbox/full-app/contract.json'],
  ['examples/task-manager/src/app.tsx', 'examples/task-manager/public/contract.json'],
  ['examples/ops-control/src/app.tsx', 'examples/ops-control/contract.json'],
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

  for (const [source, copy] of campusAssetCopies) {
    copyFileSync(resolve(root, source), resolve(root, copy));
    console.log(`synced ${copy}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
