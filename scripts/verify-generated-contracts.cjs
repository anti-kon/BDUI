#!/usr/bin/env node

const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

const root = resolve(__dirname, '..');

const contractArtifacts = [
  ['sandbox/counter/src/entry.tsx', 'sandbox/counter/contract.json'],
  ['sandbox/state/src/entry.tsx', 'sandbox/state/contract.json'],
  ['sandbox/flow/src/entry.tsx', 'sandbox/flow/contract.json'],
  ['sandbox/full-app/src/entry.tsx', 'sandbox/full-app/contract.json'],
  ['examples/ops-control/src/app.tsx', 'examples/ops-control/contract.json'],
];

function normalize(value) {
  return value.replace(/\r\n/g, '\n').trimEnd();
}

async function main() {
  const transpilerUrl = pathToFileURL(
    resolve(root, 'packages', 'transpiler', 'dist', 'index.js'),
  ).href;
  const { buildContract } = await import(transpilerUrl);
  const stale = [];

  for (const [entry, outFile] of contractArtifacts) {
    const { json } = await buildContract({
      entry: resolve(root, entry),
      mode: 'prod',
    });
    const current = normalize(readFileSync(resolve(root, outFile), 'utf8'));
    if (normalize(json) !== current) {
      stale.push(outFile);
    }
  }

  if (stale.length > 0) {
    throw new Error(`Generated contract artifacts are stale: ${stale.join(', ')}`);
  }

  console.log('Generated contract artifacts match their TSX sources.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
