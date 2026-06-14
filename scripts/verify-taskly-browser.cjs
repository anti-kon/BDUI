#!/usr/bin/env node

const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');
const net = require('node:net');
const { resolve } = require('node:path');
const { chromium, expect } = require('@playwright/test');

const root = resolve(__dirname, '..');
const tasklyRoot = resolve(root, 'examples', 'task-manager');
const serverEntry = resolve(tasklyRoot, 'dist', 'server', 'index.js');

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
    `Taskly server did not become healthy: ${lastError?.message ?? 'unknown'}\n${logs.join('')}`,
  );
}

async function stopServer(server) {
  if (server.killed) return;
  server.kill('SIGTERM');
  for (let i = 0; i < 20; i += 1) {
    if (server.killed || server.exitCode != null) return;
    await wait(100);
  }
  server.kill('SIGKILL');
}

async function main() {
  if (!existsSync(serverEntry)) {
    throw new Error('Taskly server build is missing; run npm run verify:examples first.');
  }

  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const logs = [];
  const server = spawn(process.execPath, [serverEntry], {
    cwd: tasklyRoot,
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  server.stdout.on('data', (chunk) => logs.push(chunk.toString()));
  server.stderr.on('data', (chunk) => logs.push(chunk.toString()));

  let browser;
  try {
    await waitForHealth(baseUrl, logs);

    browser = await chromium.launch({ headless: true, timeout: 30_000 });
    const context = await browser.newContext({
      viewport: { width: 1365, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    });

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await expect(page.getByText('Taskly Operations')).toBeVisible();
    await expect(page.getByText(/Contract source: (network|cache|stale)/)).toBeVisible();

    const gridCount = await page.evaluate(
      () =>
        Array.from(document.querySelectorAll('.bdui-column')).filter(
          (element) => getComputedStyle(element).display === 'grid',
        ).length,
    );
    if (gridCount < 2) {
      throw new Error(`Expected at least 2 styled BDUI grids, found ${gridCount}`);
    }

    await page.getByRole('button', { name: 'Open modal brief' }).click();
    await expect(page.getByText('BDUI capability brief')).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByText('BDUI capability brief')).toHaveCount(0);

    await page.getByRole('button', { name: 'Refresh data source' }).click();
    await expect(page.getByText('Operational')).toBeVisible();

    await page.getByRole('button', { name: 'Load static catalog' }).click();
    await expect(page.getByText('Launch readiness template')).toBeVisible();

    await page.getByRole('button', { name: 'New request' }).click();
    await expect(page.getByText('Step 1 of 3')).toBeVisible();
    await page
      .getByPlaceholder('Example: Approve billing launch for enterprise pilot')
      .fill('Approve enterprise billing pilot');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByText('Step 2 of 3')).toBeVisible();
    await page
      .getByPlaceholder('Who is affected, what changes, and how risk is reduced')
      .fill('Enterprise pilot customers get a safer launch path with clearer rollback gates.');
    await page.getByPlaceholder('25000').fill('42000');
    await page.getByRole('button', { name: 'Review' }).click();

    await expect(page.getByText('Step 3 of 3')).toBeVisible();
    await page.getByRole('button', { name: 'Submit request' }).click();
    await expect(page.getByText('Submitted', { exact: true })).toBeVisible();
    await expect(page.getByText(/REQ-[A-F0-9]{6}/)).toBeVisible();

    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByText(/Contract source: (network|cache|stale)/)).toBeVisible();
    const contractSource = await page.evaluate(() => window.__taskly?.contractSource ?? null);
    if (!['network', 'cache', 'stale'].includes(contractSource)) {
      throw new Error(`Unexpected Taskly contract source after reload: ${contractSource}`);
    }

    const screenshot = await page.screenshot({ fullPage: true });
    if (screenshot.length < 10_000) {
      throw new Error(`Taskly screenshot looks blank or too small: ${screenshot.length} bytes`);
    }

    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          url: baseUrl,
          gridCount,
          contractSource,
          screenshotBytes: screenshot.length,
        },
        null,
        2,
      ),
    );
  } finally {
    if (browser) await browser.close().catch(() => {});
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
