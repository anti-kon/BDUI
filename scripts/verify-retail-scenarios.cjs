#!/usr/bin/env node

'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');

const base = process.env.BDUI_RETAIL_URL || 'http://localhost:51337/?demo=retail';
const productNames = {
  coffee: 'Кофемашина Barista One',
  chair: 'Кресло ErgoFlex Mesh',
  lamp: 'Лампа Beam Desk',
  robot: 'Робот-пылесос CleanBot R7',
  humidifier: 'Увлажнитель AirPure Mini',
  backpack: 'Рюкзак CityPack Pro 22',
};

function flowSnapshot(page) {
  return page.evaluate(() => window._bdui.runtime.state.snapshot().flow);
}

async function route(page, id) {
  await page.goto(`${base}#${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    (routeId) => window._bdui?.runtime?.navigation?.currentRoute === routeId,
    id,
  );
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
  const errors = [];

  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  try {
    await route(page, 'cart');

    let flow = await flowSnapshot(page);
    assert.equal(flow.cartItems, 0, 'initial cartItems should be 0');
    assert.equal(flow.cartSubtotal, 0, 'initial cartSubtotal should be 0');
    assert.equal(flow.discount, 0, 'initial discount should be 0');

    let text = await page.locator('#app').innerText();
    assert.ok(text.includes('Корзина пуста'), 'cart should show an empty-state line');
    assert.ok(text.includes('К оплате: 0 ₽'), 'initial payable should be zero');

    await page.getByRole('button', { name: 'Применить промокод' }).click();
    flow = await flowSnapshot(page);
    assert.equal(flow.discount, 0, 'empty-cart promo must not create a discount');
    text = await page.locator('#app').innerText();
    assert.ok(text.includes('К оплате: 0 ₽'), 'empty-cart payable must stay zero');

    await page.evaluate(() => {
      window._bdui.runtime.state.write('flow', 'cartSubtotal', 1000);
      window._bdui.runtime.state.write('flow', 'discount', 1500);
    });
    await page.waitForFunction(() =>
      document.querySelector('#app')?.textContent?.includes('К оплате: 0 ₽'),
    );
    await page.evaluate(() => {
      for (const key of [
        'espressoQty',
        'chairQty',
        'lampQty',
        'robotQty',
        'humidifierQty',
        'backpackQty',
      ]) {
        window._bdui.runtime.state.write('flow', key, 0);
      }
      window._bdui.runtime.state.write('flow', 'cartItems', 0);
      window._bdui.runtime.state.write('flow', 'cartSubtotal', 0);
      window._bdui.runtime.state.write('flow', 'discount', 0);
      window._bdui.runtime.state.write('flow', 'featuredProduct', 'Нет');
      window._bdui.runtime.state.write('flow', 'orderStatus', 'Корзина пуста');
    });

    await route(page, 'catalog');
    await page.getByRole('button', { name: 'В корзину' }).nth(0).click();
    await page.getByRole('button', { name: 'В корзину' }).nth(1).click();
    flow = await flowSnapshot(page);
    assert.equal(flow.cartItems, 2, 'adding two products should update item count');
    assert.equal(flow.espressoQty, 1, 'first product quantity should update');
    assert.equal(flow.chairQty, 1, 'second product quantity should update');
    assert.equal(flow.cartSubtotal, 42480, 'subtotal should include both product prices');

    await route(page, 'cart');
    text = await page.locator('#app').innerText();
    assert.ok(text.includes(productNames.coffee), 'cart should show coffee line');
    assert.ok(text.includes(productNames.chair), 'cart should show chair line');
    assert.ok(text.includes('Товары: 42480 ₽'), 'cart subtotal should update visibly');
    assert.ok(text.includes('К оплате: 42480 ₽'), 'payable should update visibly before promo');

    await page.getByRole('button', { name: 'Применить промокод' }).click();
    flow = await flowSnapshot(page);
    assert.equal(
      flow.discount,
      1500,
      'promo should apply capped discount for cart over promo amount',
    );
    text = await page.locator('#app').innerText();
    assert.ok(text.includes('К оплате: 40980 ₽'), 'payable should include promo discount');

    await route(page, 'catalog');
    await page.locator('#app select').first().selectOption('Домашний офис');
    text = await page.locator('#app').innerText();
    assert.ok(text.includes(productNames.chair), 'home-office filter should show chair');
    assert.ok(text.includes(productNames.lamp), 'home-office filter should show lamp');
    assert.ok(!text.includes(productNames.coffee), 'home-office filter should hide coffee');
    assert.ok(!text.includes(productNames.robot), 'home-office filter should hide robot');

    await page.locator('#app select').first().selectOption('Все');
    await page.locator('#app select').nth(1).selectOption('Сначала дешевле');
    text = await page.locator('#app').innerText();
    const cheapFirst = [
      productNames.lamp,
      productNames.humidifier,
      productNames.backpack,
      productNames.chair,
      productNames.coffee,
      productNames.robot,
    ].map((name) => text.indexOf(name));
    assert.ok(
      cheapFirst.every((idx) => idx >= 0),
      `all products should be visible in cheap-first sort: ${cheapFirst.join(', ')}`,
    );
    assert.deepEqual(
      [...cheapFirst].sort((a, b) => a - b),
      cheapFirst,
      'cheap-first sort should reorder product cards',
    );

    await route(page, 'orders');
    text = await page.locator('#app').innerText();
    for (const orderNumber of ['LM-2026-1048', 'LM-2026-1036', 'LM-2026-1019']) {
      assert.ok(text.includes(orderNumber), `orders should include ${orderNumber}`);
    }

    if (errors.length > 0) throw new Error(errors.join('\n'));
    console.log(
      JSON.stringify(
        {
          ok: true,
          checked: [
            'cart initial zero',
            'cart list',
            'subtotal and payable',
            'promo clamp',
            'catalog filters',
            'catalog sort',
            'orders list',
          ],
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
