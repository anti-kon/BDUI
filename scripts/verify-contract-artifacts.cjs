#!/usr/bin/env node

'use strict';

const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const {
  CAMPUS,
  RETAIL,
  retailAssetGroups,
  allContractFiles,
} = require('./lib/contract-artifacts.cjs');

const root = resolve(__dirname, '..');
const cli = resolve(root, 'packages', 'cli', 'dist', 'bin.js');

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

function assertContractCopiesInSync(source, copies) {
  const canonical = readJsonFile(source);
  for (const copy of copies) {
    if (readJsonFile(copy) !== canonical) {
      throw new Error(`${copy} is out of sync with ${source}`);
    }
  }
}

for (const contract of allContractFiles()) {
  runValidation(contract);
}

assertContractCopiesInSync(CAMPUS.source, CAMPUS.copies);
assertContractCopiesInSync(RETAIL.source, RETAIL.copies);

for (const [source, copies] of retailAssetGroups()) {
  const canonicalAsset = readBinaryFile(source);
  for (const copy of copies) {
    if (!readBinaryFile(copy).equals(canonicalAsset)) {
      throw new Error(`${copy} is out of sync with ${source}`);
    }
  }
}

console.log('All BDUI contract artifacts are valid and synchronized.');
