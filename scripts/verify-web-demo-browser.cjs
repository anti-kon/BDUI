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
  ['.svg', 'image/svg+xml; charset=utf-8'],
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
  await new Promise((resolveClose, rejectClose) => {
    server.close((error) => {
      if (error) rejectClose(error);
      else resolveClose();
    });
    server.closeAllConnections?.();
  });
}

async function smoke(browserName, browserType) {
  const server = createServer();
  const port = await listen(server);
  const errors = [];
  let browser;

  try {
    browser = await browserType.launch({ headless: true, timeout: 30_000 });
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
      inputHeight: getComputedStyle(document.querySelector('#app input')).minHeight,
      inputRadius: getComputedStyle(document.querySelector('#app input')).borderRadius,
      selectHeight: getComputedStyle(document.querySelector('#app select')).minHeight,
      selectRadius: getComputedStyle(document.querySelector('#app select')).borderRadius,
    }));

    if (
      afterHashNavigation.inputHeight !== '42px' ||
      afterHashNavigation.inputRadius !== '8px' ||
      afterHashNavigation.selectHeight !== '42px' ||
      afterHashNavigation.selectRadius !== '8px'
    ) {
      throw new Error(
        `Campus form controls are not using the polished style: ${JSON.stringify(afterHashNavigation)}`,
      );
    }

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

    await page.goto(`http://127.0.0.1:${port}/?demo=retail`, { waitUntil: 'networkidle' });
    await page.waitForFunction(
      () =>
        window._bdui?.runtime?.navigation?.currentRoute === 'storefront' &&
        document.querySelector('#app')?.textContent?.includes('Luma Market'),
      null,
      { timeout: 10_000 },
    );

    const retailInitial = await page.evaluate(() => ({
      picker: document.querySelector('#demo-picker')?.value ?? null,
      route: window._bdui?.runtime?.navigation?.currentRoute ?? null,
      textLength: document.querySelector('#app')?.textContent?.length ?? 0,
    }));

    if (retailInitial.picker !== 'retail' || retailInitial.route !== 'storefront') {
      throw new Error(`Retail demo did not load correctly: ${JSON.stringify(retailInitial)}`);
    }

    await page.evaluate(() => {
      window.location.hash = 'catalog';
    });
    await page.waitForFunction(
      () =>
        window._bdui?.runtime?.navigation?.currentRoute === 'catalog' &&
        document.querySelectorAll('#app img[src*="products/"]').length >= 6,
      null,
      { timeout: 10_000 },
    );

    const retailCatalog = await page.evaluate(() => {
      const productImages = Array.from(document.querySelectorAll('#app img[src*="products/"]'));
      const loadedProductImages = productImages.filter(
        (image) => image.complete && image.naturalWidth >= 200 && image.naturalHeight >= 160,
      );
      return {
        route: window._bdui?.runtime?.navigation?.currentRoute ?? null,
        productImages: productImages.length,
        loadedProductImages: loadedProductImages.length,
        filters: document.querySelectorAll('#app select').length,
        textLength: document.querySelector('#app')?.textContent?.length ?? 0,
      };
    });

    if (
      retailCatalog.route !== 'catalog' ||
      retailCatalog.productImages < 6 ||
      retailCatalog.loadedProductImages < 6 ||
      retailCatalog.filters < 2
    ) {
      throw new Error(`Retail catalog visuals are incomplete: ${JSON.stringify(retailCatalog)}`);
    }

    await page.evaluate(() => {
      window.location.hash = 'checkout';
    });
    await page.waitForFunction(
      () =>
        window._bdui?.runtime?.navigation?.currentRoute === 'checkout' &&
        document.querySelectorAll('#app input, #app select').length >= 5,
      null,
      { timeout: 10_000 },
    );

    const retailCheckout = await page.evaluate(() => {
      const input = document.querySelector('#app input');
      const select = document.querySelector('#app select');
      const inputStyle = input ? getComputedStyle(input) : null;
      const selectStyle = select ? getComputedStyle(select) : null;
      return {
        controls: document.querySelectorAll('#app input, #app select').length,
        route: window._bdui?.runtime?.navigation?.currentRoute ?? null,
        inputHeight: inputStyle?.minHeight ?? null,
        inputRadius: inputStyle?.borderRadius ?? null,
        selectHeight: selectStyle?.minHeight ?? null,
      };
    });

    if (
      retailCheckout.route !== 'checkout' ||
      retailCheckout.controls < 5 ||
      retailCheckout.inputHeight !== '42px' ||
      retailCheckout.inputRadius !== '8px'
    ) {
      throw new Error(`Retail checkout form looks incomplete: ${JSON.stringify(retailCheckout)}`);
    }

    console.log(
      JSON.stringify(
        {
          browser: browserName,
          retailInitial,
          retailCatalog,
          retailCheckout,
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
