#!/usr/bin/env node

'use strict';

const { copyFileSync, mkdirSync, writeFileSync } = require('node:fs');
const { dirname, resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

const {
  CONTRACT_SOURCES,
  CAMPUS,
  RETAIL,
  CAMPUS_ASSET_COPIES,
  retailAssetPairs,
} = require('./lib/contract-artifacts.cjs');

const root = resolve(__dirname, '..');

function syncFile(source, copy) {
  const target = resolve(root, copy);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(resolve(root, source), target);
  console.log(`synced ${copy}`);
}

async function main() {
  const transpilerUrl = pathToFileURL(
    resolve(root, 'packages', 'transpiler', 'dist', 'index.js'),
  ).href;
  const { buildContract } = await import(transpilerUrl);

  for (const [entry, outFile] of CONTRACT_SOURCES) {
    const { json } = await buildContract({
      entry: resolve(root, entry),
      mode: 'prod',
    });
    writeFileSync(resolve(root, outFile), `${json}\n`);
    console.log(`built ${outFile}`);
  }

  for (const copy of CAMPUS.copies) syncFile(CAMPUS.source, copy);
  for (const copy of RETAIL.copies) syncFile(RETAIL.source, copy);
  for (const [source, copy] of CAMPUS_ASSET_COPIES) syncFile(source, copy);
  for (const [source, copy] of retailAssetPairs()) syncFile(source, copy);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
