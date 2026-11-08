import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

test('third lesson teacher gate and source solutions at mobile and desktop', { timeout: 120000 }, async () => {
  const port = 4183, base = `http://127.0.0.1:${port}/`;
  let executablePath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
  let args = ['--no-sandbox', '--disable-dev-shm-usage', '--single-process', '--no-zygote'];
  if (!existsSync(executablePath)) { const { default: pack } = await import('@sparticuz/chromium'); executablePath = await pack.executablePath(); args = pack.args; }
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { stdio: 'ignore' });
  let browser;
  try {
    let ready = false;
    for (let i = 0; i < 200; i++) { try { if ((await fetch(base)).ok) { ready = true; break; } } catch {} await new Promise(r => setTimeout(r, 100)); }
    assert.ok(ready);
    browser = await chromium.launch({ executablePath, args, headless: true });
    const page = await browser.newPage();
    for (const width of [390, 1366]) {
      await page.setViewportSize({ width, height: 850 });
      const errors = []; const handler = e => errors.push(e.message); page.on('pageerror', handler);
      await page.goto(`${base}#/lesson/forces-one-carrier/book`);
      await page.locator('[data-book-tab="forces-problems"]').click();
      await page.locator('#forces-problems details').nth(1).evaluate(el => { el.open = true; });
      assert.match(await page.locator('#forces-problems').innerText(), /لا يسمّي الرسم السهم/);
      assert.equal(await page.locator('.solution-question').count(), 0, 'student page contains no teacher solutions');
      await page.goto(`${base}#/teacher`);
      assert.equal(await page.locator('.solution-question').count(), 0, 'no solutions in DOM before login');
      await page.locator('#teacher-password').fill('wrong'); await page.locator('[data-teacher-login] button').click();
      assert.equal(await page.locator('.solution-question').count(), 0, 'wrong password does not reveal solutions');
      await page.locator('#teacher-password').fill('somer173'); await page.locator('[data-teacher-login] button').click();
      await page.locator('#teacher-tab-motion-forces-one-carrier').click();
      const panel = page.locator('#teacher-panel-motion-forces-one-carrier');
      assert.equal(await panel.isVisible(), true);
      const q1 = panel.locator('#solution-forces-one-carrier-q1');
      assert.match(await q1.innerText(), /F₁ > F₂/); assert.match(await q1.innerText(), /\(a\) F = F₁ − F₂/);
      assert.match(await panel.locator('#solution-forces-one-carrier-q2').innerText(), /وليسا زوج فعل وردّ فعل/);
      assert.match(await panel.locator('#solution-forces-one-carrier-q3').innerText(), /المعطيات غير كافية/);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `no overflow at ${width}`);
      await page.locator('[data-teacher-logout]').click();
      assert.equal(await page.locator('.solution-question').count(), 0, 'logout removes solutions');
      await page.reload(); assert.equal(await page.locator('.solution-question').count(), 0, 'reload remains locked');
      assert.deepEqual(errors, []); page.off('pageerror', handler);
    }
  } finally { await browser?.close(); server.kill(); }
});
