// Independent regression checks: failures in one lesson must not hide checks in the other.
import { test, before, after } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const port = 4181;
const base = `http://127.0.0.1:${port}/`;
const stages = ['discover', 'book', 'explain', 'examples', 'activity', 'questions', 'practice', 'summary', 'notebook'];
let server, browser, page;
before(async () => {
  let executablePath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
  let args = ['--no-sandbox', '--disable-dev-shm-usage', '--single-process', '--no-zygote'];
  if (!existsSync(executablePath)) {
    const { default: pack } = await import('@sparticuz/chromium');
    pack.setGraphicsMode = false;
    executablePath = await pack.executablePath();
    args = pack.args;
  }
  server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { stdio: 'ignore' });
  let ready = false;
  for (let i = 0; i < 200; i++) {
    try { if ((await fetch(base)).ok) { ready = true; break; } } catch { /* starting */ }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, 'Vite started');
  browser = await chromium.launch({ executablePath, args, headless: true });
  page = await browser.newPage();
});
after(async () => { await browser?.close(); server?.kill(); });

async function checkStages(lesson, excluded = []) {
  const errors = [];
  const onError = error => errors.push(error.message);
  page.on('pageerror', onError);
  try {
    for (const [width, height] of [[1366, 768], [768, 1024], [390, 844]]) {
      await page.setViewportSize({ width, height });
      for (const stage of stages.filter(stage => !excluded.includes(stage))) {
        await page.goto(`${base}#/lesson/${lesson}/${stage}`);
        await page.waitForFunction(expected => document.querySelector('.stage-nav a[aria-current=step]')?.getAttribute('href') === expected, `#/lesson/${lesson}/${stage}`);
        assert.equal(await page.locator('.stage-nav a[aria-current="step"]').count(), 1, `${lesson}/${stage}`);
        assert.ok(await page.locator('#stage-title').isVisible(), `${lesson}/${stage}`);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${lesson}/${stage} overflow at ${width}`);
      }
    }
    assert.deepEqual(errors, [], `${lesson} has no JavaScript errors`);
  } finally { page.off('pageerror', onError); }
}

test('first lesson: nine stages and motion lab at desktop, tablet and mobile widths', { timeout: 120000 }, async () => {
  await checkStages('motion-rest');
});
test('second lesson: all stages except the separately tested force lab at three widths', { timeout: 120000 }, async () => {
  await checkStages('force-motion', ['activity']);
});
test('second lesson: book tabs, understanding and practice feedback', { timeout: 30000 }, async () => {
  await page.goto(`${base}#/lesson/force-motion/book`);
  await page.locator('[data-book-tab="force-relation"]').click();
  assert.equal(await page.locator('#force-relation').isVisible(), true);
  await page.goto(`${base}#/lesson/force-motion/questions`);
  await page.locator('[data-qid="fm-u-elements"][data-value="الكتلة"]').click();
  assert.equal(await page.locator('[data-question-card="fm-u-elements"] .answer-feedback.correct').count(), 1);
  await page.goto(`${base}#/lesson/force-motion/practice`);
  await page.locator('[data-match-select="fm-point"]').selectOption('نقطة التأثير');
  await page.locator('[data-match-select="fm-line"]').selectOption('الحامل');
  await page.locator('[data-match-select="fm-side"]').selectOption('الجهة');
  await page.locator('[data-match-select="fm-mag"]').selectOption('الشدة');
  await page.locator('[data-check-matching]').click();
  assert.match(await page.locator('.practice-level').first().innerText(), /4 من 4/);
  await page.locator('#input-fm-num-weight').fill('١٠٠');
  await page.locator('[data-check-numeric="fm-num-weight"]').click();
  assert.equal(await page.locator('[data-numeric-card="fm-num-weight"] .answer-feedback.correct').count(), 1);
});
test('second lesson: force lab mounts and exposes its interactive controls', { timeout: 30000 }, async () => {
  const errors = [];
  const onError = error => errors.push(error.message);
  page.on('pageerror', onError);
  try {
    await page.goto(`${base}#/lesson/force-motion/activity`);
    await page.waitForSelector('#force-lab', { state: 'attached' });
    assert.deepEqual(errors, [], 'force lab must mount without JavaScript errors');
    assert.equal(await page.locator('[data-lab-input="force"]').count(), 1);
    await page.locator('[data-lab-input="force"]').evaluate(el => { el.value = '8'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    assert.match(await page.locator('.force-lab .force-scene-svg').textContent(), /F = 8 N/);
  } finally { page.off('pageerror', onError); }
});
