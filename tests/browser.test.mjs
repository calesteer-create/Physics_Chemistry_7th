// Requires a locally installed Chromium. Set CHROMIUM_PATH if it is not on PATH.
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

const base = 'http://127.0.0.1:4175';
const executablePath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';

test('Chromium: responsive navigation, lesson interactions and accessibility foundations', { timeout: 90000 }, async () => {
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4175', '--strictPort'], { stdio: 'ignore' });
  let browser;
  try {
    let ready = false;
    for (let i = 0; i < 100; i++) {
      try { if ((await fetch(base)).ok) { ready = true; break; } } catch { /* starting */ }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(ready, 'Vite server started');
    browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--single-process', '--no-zygote'] });
    const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const [width, height] of [[1366, 768], [1920, 1080], [768, 1024], [390, 844]]) {
      await page.setViewportSize({ width, height });
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
      assert.equal(await page.locator('a[href="https://wa.me/963930210222"]').count(), 2);
      const noOverflow = async () => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `horizontal overflow at ${width}px`);
      await noOverflow();
      await page.locator('.hero-actions [data-page="dashboard"]').click();
      assert.match(await page.locator('main h1').innerText(), /نور/);
      await noOverflow();
      await page.locator('.continue-card [data-page="lesson"]').click();
      for (let i = 0; i < 7; i++) {
        const tab = page.locator(`[data-step="${i}"]`);
        await tab.click();
        assert.equal(await tab.getAttribute('aria-current'), 'step');
        assert.ok(await tab.evaluate(el => { const item = el.getBoundingClientRect(); const nav = el.parentElement.getBoundingClientRect(); return item.left >= nav.left - 1 && item.right <= nav.right + 1; }), 'current station remains visible');
        assert.equal(await page.locator('#lesson-title').count(), 1);
        assert.equal(await page.evaluate(() => document.activeElement?.dataset.step), String(i));
        await noOverflow();
      }
      assert.match(await page.locator('#lesson-title').innerText(), /دفتر الاكتشاف/);
      assert.equal(await page.locator('.formula').getAttribute('dir'), 'ltr');
      await page.locator('.notebook-item input').first().check();
      assert.equal(await page.locator('.notebook-item input').first().isChecked(), true);
      await page.locator('[data-step="3"]').click();
      await page.locator('[data-choice]').first().click();
      assert.equal(await page.locator('[data-choice]').first().getAttribute('aria-pressed'), 'true');
      assert.equal(await page.evaluate(() => document.activeElement?.dataset.choice), '◯');
      assert.match(await page.locator('.choice-feedback').innerText(), /تم اختيارك/);
      await page.locator('[data-next]').click();
      assert.equal(await page.locator('[data-step="4"]').getAttribute('aria-current'), 'step');
      assert.equal(await page.evaluate(() => document.activeElement?.id), 'lesson-title');
      await page.locator('[data-prev]').click();
      assert.equal(await page.locator('[data-step="3"]').getAttribute('aria-current'), 'step');
    }
    await page.goto(base);
    const cta = page.locator('.hero-actions .button-dark');
    const background = await cta.evaluate(el => getComputedStyle(el).backgroundColor);
    await cta.hover();
    await page.waitForTimeout(250);
    assert.notEqual(await cta.evaluate(el => getComputedStyle(el).backgroundColor), background, 'hover feedback changes the button');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
    await page.goto(base);
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.matches(':focus-visible')), true);
    assert.notEqual(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle), 'none');
    assert.deepEqual(errors, []);
  } finally {
    await browser?.close();
    server.kill();
  }
});
