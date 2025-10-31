#!/usr/bin/env node

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const demoDir = path.join(rootDir, 'sandbox', 'web-demo');
const vendorDir = path.join(demoDir, 'vendor');

const commonDist = path.join(rootDir, 'packages', 'common', 'dist');
const defsDist = path.join(rootDir, 'packages', 'defs', 'dist');
const dslDist = path.join(rootDir, 'packages', 'dsl', 'dist');
const rendererDist = path.join(rootDir, 'packages', 'renderer-web', 'dist');

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', cwd: rootDir, env: process.env });
}

function copyDir(src, dest) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function ensureBuildOutputs() {
  if (!fs.existsSync(commonDist)) {
    run('npm run build -w @bdui/common');
  }
  if (!fs.existsSync(defsDist)) {
    run('npm run build -w @bdui/defs');
  }
  if (!fs.existsSync(dslDist)) {
    run('npm run build -w @bdui/dsl');
  }
  if (!fs.existsSync(rendererDist)) {
    run('npm run build -w @bdui/renderer-web');
  }
}

ensureBuildOutputs();

const vendorCommonDir = path.join(vendorDir, 'common');
const vendorDefsDir = path.join(vendorDir, 'defs');
const vendorDslDir = path.join(vendorDir, 'dsl');
const vendorRendererDir = path.join(vendorDir, 'renderer-web');

copyDir(commonDist, vendorCommonDir);
copyDir(defsDist, vendorDefsDir);
copyDir(dslDist, vendorDslDir);
copyDir(rendererDist, vendorRendererDir);

console.log(`✔ BDUI web-demo is prepared in ${vendorDir}`);
