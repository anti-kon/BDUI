#!/usr/bin/env node

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const demoDir = path.join(rootDir, 'sandbox', 'web-demo');
const vendorDir = path.join(demoDir, 'vendor');
const campusAsset = path.join(rootDir, 'examples', 'ops-control', 'public', 'campus-mark.svg');
const demoCampusAsset = path.join(demoDir, 'campus-mark.svg');

const packagesToVendor = [
  { name: '@bdui/core', dir: 'core' },
  { name: '@bdui/expr', dir: 'expr' },
  { name: '@bdui/runtime', dir: 'runtime' },
  { name: '@bdui/defs', dir: 'defs' },
  { name: '@bdui/dsl', dir: 'dsl' },
  { name: '@bdui/renderer-web', dir: 'renderer-web' },
];

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
  for (const pkg of packagesToVendor) {
    const dist = path.join(rootDir, 'packages', pkg.dir, 'dist');
    if (!fs.existsSync(dist)) {
      run(`npm run build -w ${pkg.name}`);
    }
  }
}

ensureBuildOutputs();

for (const pkg of packagesToVendor) {
  const dist = path.join(rootDir, 'packages', pkg.dir, 'dist');
  const target = path.join(vendorDir, pkg.dir);
  copyDir(dist, target);
}

fs.copyFileSync(campusAsset, demoCampusAsset);

console.log(`✔ BDUI web-demo is prepared in ${vendorDir}`);
