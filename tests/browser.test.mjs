// Requires a local Chromium. Set CHROMIUM_PATH if it is not at /usr/bin/chromium.
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

const base = 'http://127.0.0.1:4175';
const executablePath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
const WHATSAPP = 'https://wa.me/963930210222';
const WELCOME = 'أهلاً بك في عالم الفيزياء الممتعة!';
const viewports = [[1366, 768], [1920, 1080], [768, 1024], [390, 844]];
const stageTitles = [
  'اكتشاف وتمهيد', 'محتوى الكتاب', 'شرح مبسط وموسع', 'أمثلة مفصلة', 'نشاط أو محاكاة',
  'أسئلة لفهم الطالب', 'تدريب متدرج', 'اختبار الدرس', 'ملخص الدرس', 'دفتر الطالب',
];

test('Chromium: RTL, one ordered path, ten stages, notebook, focus, links and layout', { timeout: 300000 }, async () => {
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4175', '--strictPort'], { stdio: 'ignore' });
  let browser;
  try {
    let ready = false;
    for (let i = 0; i < 200; i++) {
      try { if ((await fetch(base)).ok) { ready = true; break; } } catch { /* starting */ }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(ready, 'Vite server started');
    browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--single-process', '--no-zygote'] });
    const errors = [];
    // One page is reused: the --single-process launch flags close the browser when a page closes.
    const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));

    for (const [width, height] of viewports) {
      await page.setViewportSize({ width, height });
      const noOverflow = async (label) => assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `horizontal overflow at ${width}px (${label})`,
      );

      // Home
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      assert.equal(await page.locator('html').getAttribute('lang'), 'ar');
      assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
      assert.equal((await page.locator('main h1').innerText()).trim(), WELCOME);
      assert.equal(await page.locator(`a[href="${WHATSAPP}"]`).count(), 1, 'exactly one WhatsApp link');
      const bodyText = await page.locator('body').innerText();
      assert.doesNotMatch(bodyText, /نور/);
      assert.doesNotMatch(bodyText, /تواصل عبر واتساب/);
      assert.doesNotMatch(bodyText, /بعودتك/);
      await noOverflow('home');

      // Path
      await page.locator('.main-nav a', { hasText: 'المسار الدراسي' }).click();
      await page.waitForURL(/#\/path$/);
      assert.equal((await page.locator('main h1').innerText()).trim(), 'المسار الدراسي');
      assert.equal(await page.evaluate(() => document.activeElement?.tagName), 'H1', 'focus moves to the page heading');
      assert.equal(await page.locator('.path-list > li').count(), 1, 'single ordered path, demo lesson only');
      await noOverflow('path');

      // Lesson and its ten stages
      await page.locator('.lesson-card').first().click();
      await page.waitForURL(/#\/lesson\/demo$/);
      assert.equal(await page.locator('.stage-nav ol a').nth(0).getAttribute('aria-current'), 'step', 'first stage is current on entry');
      assert.equal((await page.locator('#stage-title').innerText()).trim(), stageTitles[0]);
      for (let i = 1; i < stageTitles.length; i++) {
        const link = page.locator('.stage-nav ol a').nth(i);
        await link.click();
        assert.equal(await link.getAttribute('aria-current'), 'step', `stage ${i + 1} is current`);
        assert.equal((await page.locator('#stage-title').innerText()).trim(), stageTitles[i]);
        assert.equal(await page.evaluate(() => document.activeElement?.id), 'stage-title', `focus on stage ${i + 1} heading`);
        await noOverflow(`stage ${i + 1}`);
      }
      assert.equal(await page.locator('.note-card').count(), 9, 'notebook has nine sections');
      assert.ok(await page.locator('.katex').count() >= 1, 'KaTeX renders the demo formula');
      assert.equal(await page.locator('.formula').first().getAttribute('dir'), 'ltr');
      assert.equal(await page.locator('.quantity').first().getAttribute('dir'), 'ltr');
      await noOverflow('notebook');

      // Activity interaction keeps focus on the pressed choice
      await page.goto(`${base}/#/lesson/demo/activity`);
      await page.locator('[data-choice="1"]').click();
      assert.equal(await page.locator('[data-choice="1"]').getAttribute('aria-pressed'), 'true');
      assert.equal(await page.evaluate(() => document.activeElement?.dataset.choice), '1', 'focus stays on the choice');
      assert.match(await page.locator('.feedback').innerText(), /تم اختيارك/);

      // Keyboard: skip link is first, and moves focus into the content
      await page.goto(base);
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement?.dataset.skip !== undefined), true, 'skip link first');
      await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(() => document.activeElement?.id), 'main', 'skip link focuses main');
    }

    // Unknown route and reduced motion
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(`${base}/#/nope`);
    assert.equal((await page.locator('main h1').innerText()).trim(), 'الصفحة غير متوفرة');
    await page.goto(base);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.btn')).transitionDuration), '0s');
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');

    assert.deepEqual(errors, []);
  } finally {
    await browser?.close();
    server.kill();
  }
});
