#!/usr/bin/env node

const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const { readdirSync, readFileSync, statSync } = require('node:fs');
const { join, relative, resolve } = require('node:path');

const root = resolve(__dirname, '..');
const vendorDir = resolve(root, 'sandbox', 'web-demo', 'vendor');
const prepareScript = resolve(root, 'scripts', 'prepare-web-demo.cjs');
const strictCommittedCheck =
  process.argv.includes('--committed') || process.env.BDUI_STRICT_WEB_DEMO_ARTIFACTS === '1';

function listFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const files = [];
  for (const entry of entries) {
    const entryPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }
  return files;
}

function hashDirectory(dir) {
  const hash = createHash('sha256');
  for (const file of listFiles(dir)) {
    const rel = relative(dir, file).replaceAll('\\', '/');
    const stat = statSync(file);
    hash.update(rel);
    hash.update('\0');
    hash.update(String(stat.size));
    hash.update('\0');
    hash.update(readFileSync(file));
    hash.update('\0');
  }
  return hash.digest('hex');
}

function prepareWebDemo() {
  execFileSync(process.execPath, [prepareScript], { cwd: root, stdio: 'inherit' });
  return hashDirectory(vendorDir);
}

if (strictCommittedCheck) {
  const before = hashDirectory(vendorDir);
  const after = prepareWebDemo();

  if (after !== before) {
    throw new Error(
      'sandbox/web-demo/vendor is stale; run npm run prepare:web-demo and commit the result.',
    );
  }

  console.log('BDUI web-demo vendor artifacts are synchronized.');
  process.exit(0);
}

const first = prepareWebDemo();
const second = prepareWebDemo();

if (second !== first) {
  throw new Error(
    'sandbox/web-demo/vendor preparation is not deterministic; running prepare:web-demo twice produced different output.',
  );
}

console.log('BDUI web-demo vendor artifacts are prepared and deterministic.');
