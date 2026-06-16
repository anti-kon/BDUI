#!/usr/bin/env node

const { execFileSync, spawn } = require('node:child_process');
const { createServer } = require('node:http');
const { mkdirSync } = require('node:fs');
const { readFile } = require('node:fs/promises');
const net = require('node:net');
const { extname, resolve } = require('node:path');
const { chromium, expect } = require('@playwright/test');

const root = resolve(__dirname, '..');
const outputDir = resolve(root, 'docs', 'assets');
const tasklyRoot = resolve(root, 'examples', 'task-manager');
const tasklyServerEntry = resolve(tasklyRoot, 'dist', 'server', 'index.js');
const webDemoRoot = resolve(root, 'sandbox', 'web-demo');
const npmCli = process.env.npm_execpath;
const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
]);

function runNpm(args) {
  if (npmCli) {
    execFileSync(process.execPath, [npmCli, ...args], {
      cwd: root,
      stdio: 'inherit',
      env: process.env,
    });
    return;
  }

  execFileSync(npmBin, args, {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32',
  });
}

function wait(ms) {
  return new Promise((resolveWait) => setTimeout(resolveWait, ms));
}

async function availablePort() {
  const server = net.createServer();
  await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  await new Promise((resolveClose) => server.close(resolveClose));
  return port;
}

async function waitForHealth(baseUrl, logs) {
  let lastError;
  for (let i = 0; i < 60; i += 1) {
    try {
      const response = await fetch(`${baseUrl}/healthz`);
      if (response.ok) return;
      lastError = new Error(`healthz returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await wait(250);
  }
  throw new Error(
    `Taskly did not become healthy: ${lastError?.message ?? 'unknown'}\n${logs.join('')}`,
  );
}

async function stopTaskly(server) {
  if (server.killed) return;
  server.kill('SIGTERM');
  for (let i = 0; i < 20; i += 1) {
    if (server.killed || server.exitCode != null) return;
    await wait(100);
  }
  server.kill('SIGKILL');
}

function createWebDemoServer() {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://127.0.0.1');
      const requested = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
      const file = resolve(webDemoRoot, `.${requested}`);
      if (!file.startsWith(webDemoRoot)) {
        res.writeHead(403).end('Forbidden');
        return;
      }

      const body = await readFile(file);
      res.writeHead(200, {
        'cache-control': 'no-store',
        'content-type': contentTypes.get(extname(file)) ?? 'application/octet-stream',
      });
      res.end(body);
    } catch {
      res.writeHead(404).end('Not found');
    }
  });
}

async function listen(server) {
  await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
  return server.address().port;
}

async function close(server) {
  await new Promise((resolveClose, rejectClose) => {
    server.close((error) => {
      if (error) rejectClose(error);
      else resolveClose();
    });
    server.closeAllConnections?.();
  });
}

async function captureTaskly(browser) {
  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const logs = [];
  const server = spawn(process.execPath, [tasklyServerEntry], {
    cwd: tasklyRoot,
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  server.stdout.on('data', (chunk) => logs.push(chunk.toString()));
  server.stderr.on('data', (chunk) => logs.push(chunk.toString()));

  const page = await browser.newPage({
    viewport: { width: 1365, height: 900 },
    deviceScaleFactor: 1,
  });
  try {
    await waitForHealth(baseUrl, logs);
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await expect(page.getByText('Операционный пульт')).toBeVisible();
    await page.screenshot({ path: resolve(outputDir, 'taskly-dashboard.png'), fullPage: true });

    await page.getByRole('button', { name: 'Настройки' }).click();
    await expect(page.getByText('Профиль и пространство')).toBeVisible();
    const optionSets = await page
      .locator('select')
      .evaluateAll((selects) =>
        selects.map((select) => Array.from(select.options).map((option) => option.value)),
      );
    const themeIndex = optionSets.findIndex((options) => options.includes('Тёмная'));
    if (themeIndex < 0) throw new Error(`Theme select not found: ${JSON.stringify(optionSets)}`);
    await page.locator('select').nth(themeIndex).selectOption('Тёмная');
    await expect(page.locator('#app .bdui-column').first()).toHaveCSS(
      'background-color',
      'rgb(15, 23, 42)',
    );
    await page.screenshot({ path: resolve(outputDir, 'taskly-settings-dark.png'), fullPage: true });
  } finally {
    await page.close().catch(() => {});
    await stopTaskly(server);
  }
}

async function captureWebDemo(browser) {
  const server = createWebDemoServer();
  const port = await listen(server);
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });
  try {
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
    await page.waitForFunction(
      () => window._bdui && document.querySelector('#app')?.textContent?.length > 100,
      null,
      { timeout: 10_000 },
    );
    await page.evaluate(() => {
      window.location.hash = 'settings';
    });
    await page.waitForFunction(
      () => window._bdui?.runtime?.navigation?.currentRoute === 'settings',
    );
    await page.screenshot({ path: resolve(outputDir, 'web-demo-settings.png'), fullPage: true });
  } finally {
    await page.close().catch(() => {});
    await close(server);
  }
}

async function main() {
  mkdirSync(outputDir, { recursive: true });
  runNpm(['run', 'verify:examples']);
  runNpm(['run', 'verify:web-demo']);

  const browser = await chromium.launch({ headless: true, timeout: 30_000 });
  try {
    await captureTaskly(browser);
    await captureWebDemo(browser);
  } finally {
    await browser.close();
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        files: [
          'docs/assets/taskly-dashboard.png',
          'docs/assets/taskly-settings-dark.png',
          'docs/assets/web-demo-settings.png',
        ],
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
