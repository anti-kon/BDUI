#!/usr/bin/env node

const http = require('node:http');
const { createHash } = require('node:crypto');
const { readFile } = require('node:fs/promises');
const { extname, resolve } = require('node:path');
const { chromium, firefox, webkit } = require('@playwright/test');

const root = resolve(__dirname, '..');
const demoRoot = resolve(root, 'sandbox', 'web-demo');
const browserTypes = { chromium, firefox, webkit };
const requestedBrowser = process.env.BDUI_BROWSER || process.argv[2] || 'chromium';
const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
]);

function createServer() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://127.0.0.1');
      const requested = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
      const file = resolve(demoRoot, `.${requested}`);
      if (!file.startsWith(demoRoot)) {
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
  await new Promise((resolveClose) => server.close(resolveClose));
}

async function smoke(browserName, browserType) {
  const server = createServer();
  const port = await listen(server);
  const errors = [];
  let browser;

  try {
    browser = await browserType.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    });

    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
    await page.waitForFunction(
      () => window._bdui && document.querySelector('#app')?.textContent?.length > 100,
      null,
      { timeout: 10_000 },
    );

    const initial = await page.evaluate(() => ({
      buttons: document.querySelectorAll('#app button').length,
      route: window._bdui?.runtime?.navigation?.currentRoute ?? null,
      textLength: document.querySelector('#app')?.textContent?.length ?? 0,
    }));

    if (initial.route !== 'home') {
      throw new Error(`Expected initial route "home", got "${initial.route}"`);
    }
    if (initial.buttons < 3 || initial.textLength < 100) {
      throw new Error(`Initial render looks incomplete: ${JSON.stringify(initial)}`);
    }

    await page.evaluate(() => {
      window.location.hash = 'settings';
    });
    await page.waitForFunction(
      () => window._bdui?.runtime?.navigation?.currentRoute === 'settings',
    );
    await page.waitForFunction(
      () => document.querySelectorAll('#app input, #app select').length >= 1,
    );

    const afterHashNavigation = await page.evaluate(() => ({
      controls: document.querySelectorAll('#app input, #app select').length,
      route: window._bdui?.runtime?.navigation?.currentRoute ?? null,
      textLength: document.querySelector('#app')?.textContent?.length ?? 0,
    }));

    const screenshot = await page.screenshot({ fullPage: true });
    const digest = createHash('sha256').update(screenshot).digest('hex');
    const nonWhiteSample = [...screenshot].some((byte) => byte !== 0xff && byte !== 0x00);

    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }
    if (!nonWhiteSample || screenshot.length < 10_000) {
      throw new Error(`Screenshot looks blank or too small: ${screenshot.length} bytes`);
    }

    console.log(
      JSON.stringify(
        {
          browser: browserName,
          initial,
          afterHashNavigation,
          screenshotBytes: screenshot.length,
          screenshotSha256: digest,
        },
        null,
        2,
      ),
    );
  } finally {
    if (browser) await browser.close();
    await close(server);
  }
}

async function main() {
  const names = requestedBrowser === 'all' ? Object.keys(browserTypes) : [requestedBrowser];
  for (const browserName of names) {
    const browserType = browserTypes[browserName];
    if (!browserType) {
      throw new Error(`Unknown browser "${browserName}". Use chromium, firefox, webkit, or all.`);
    }
    await smoke(browserName, browserType);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
