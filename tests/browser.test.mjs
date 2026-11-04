// يتطلب Chromium. استخدم CHROMIUM_PATH أو ثبّت @sparticuz/chromium محلياً دون حفظه.
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const production = process.env.PRODUCTION === '1';
const port = production ? 4176 : 4175;
const base = `http://127.0.0.1:${port}${production ? '/Physics_Chemistry_7th' : ''}/`;
const viewports = [[1366, 768], [1920, 1080], [768, 1024], [390, 844]];
const stageTitles = ['اكتشاف وتمهيد', 'محتوى الكتاب', 'شرح مبسط وموسع', 'أمثلة مفصلة', 'نشاط أو محاكاة', 'أسئلة لفهم الطالب', 'تدريب متدرج', 'اختبار الدرس', 'ملخص الدرس', 'دفتر الطالب'];

let executablePath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
let launchArgs = ['--no-sandbox', '--disable-dev-shm-usage', '--single-process', '--no-zygote'];
if (!existsSync(executablePath)) {
  try {
    const { default: chromiumPack } = await import('@sparticuz/chromium');
    chromiumPack.setGraphicsMode = false;
    executablePath = await chromiumPack.executablePath();
    launchArgs = chromiumPack.args;
  } catch {
    throw new Error('Chromium غير متوفر. حدد CHROMIUM_PATH أو ثبّت @sparticuz/chromium للفحص المحلي.');
  }
}

const range = async (page, id, value) => {
  await page.locator(`[data-lab-input="${id}"]`).evaluate((element, nextValue) => {
    element.value = String(nextValue);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
};

const assertBusInsideSvg = async page => {
  const svg = await page.locator('[data-reference-svg]').boundingBox();
  const bus = await page.locator('[data-bus-group]').boundingBox();
  assert.ok(svg && bus, 'reference SVG and bus must have visible geometry');
  assert.ok(bus.x >= svg.x - 1 && bus.x + bus.width <= svg.x + svg.width + 1,
    `bus must not clip horizontally: ${JSON.stringify({ svg, bus })}`);
};

test('Chromium: navigation, ten stages, real lab, assessments, KaTeX and four responsive sizes', { timeout: 300000 }, async () => {
  const serverArgs = production
    ? ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort']
    : ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(port), '--strictPort'];
  const server = spawn(process.execPath, serverArgs, { stdio: 'ignore' });
  let browser;
  try {
    let ready = false;
    for (let i = 0; i < 200; i++) {
      try { if ((await fetch(base)).ok) { ready = true; break; } } catch { /* starting */ }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(ready, 'Vite server started');
    browser = await chromium.launch({ executablePath, headless: true, args: launchArgs });
    const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    const errors = [];
    const localFailures = [];
    const katexFontResponses = [];
    page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
    page.on('response', response => {
      if (response.url().startsWith(base) && response.status() >= 400) localFailures.push(`${response.status()} ${response.url()}`);
      if (/KaTeX.*\.woff2?(?:$|\?)/.test(response.url()) && response.ok()) katexFontResponses.push(response.url());
    });
    const noOverflow = async label => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `horizontal overflow at ${page.viewportSize().width}px (${label})`);
    const noMathErrors = async () => {
      assert.equal(await page.locator('.math-fallback').count(), 0, 'no KaTeX fallback is visible');
      const formulas = page.locator('.formula');
      if (await formulas.count()) assert.equal(await formulas.first().getAttribute('dir'), 'ltr');
    };

    // الرئيسية لا تعرض بطاقة الدرس؛ الوحدة هي المدخل المستقل.
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('html').getAttribute('lang'), 'ar');
    assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
    assert.equal(await page.locator('.lesson-card').count(), 0);
    assert.equal(await page.locator('.main-nav a', { hasText: 'الوحدة الأولى: الحركة والتحريك' }).count(), 1);
    await page.locator('.main-nav a', { hasText: 'الوحدة الأولى: الحركة والتحريك' }).click();
    await page.waitForURL(/#\/unit\/motion$/);
    await page.waitForFunction(() => document.querySelector('main h1')?.textContent === 'الوحدة الأولى: الحركة والتحريك');
    assert.equal((await page.locator('main h1').innerText()).trim(), 'الوحدة الأولى: الحركة والتحريك');
    assert.equal(await page.locator('.path-list > li').count(), 1);
    assert.equal((await page.locator('.lesson-card').innerText()).includes('الحركة والسكون'), true);
    assert.equal(await page.evaluate(() => document.activeElement?.tagName), 'H1');
    await noOverflow('unit');

    // الدخول إلى الدرس والتنقل المتتابع بين المراحل العشر.
    await page.locator('.lesson-card').click();
    await page.waitForURL(/#\/lesson\/motion-rest$/);
    await page.locator('#stage-title').waitFor();
    for (let i = 0; i < stageTitles.length; i++) {
      const link = page.locator('.stage-nav ol a').nth(i);
      if (i) await link.click();
      await page.waitForFunction(index => document.querySelectorAll('.stage-nav ol a')[index]?.getAttribute('aria-current') === 'step', i);
      assert.equal(await link.getAttribute('aria-current'), 'step', `stage ${i + 1} is current`);
      assert.equal((await page.locator('#stage-title').innerText()).trim(), stageTitles[i]);
      if (i === 0) assert.equal(await page.evaluate(() => document.activeElement?.tagName), 'H1', 'focus on lesson heading when entering the lesson');
      else assert.equal(await page.evaluate(() => document.activeElement?.id), 'stage-title', `focus on stage ${i + 1}`);
      await noOverflow(`stage ${i + 1}`);
      if (i === 1) {
        assert.ok(await page.locator('.stage-book .katex').count() > 50, 'book equations use KaTeX');
        assert.ok(await page.locator('.stage-book .mfrac').count() > 0, 'vertical fractions are rendered');
        assert.ok(await page.locator('.stage-book .msupsub').count() > 0, 'subscripts are rendered');
        assert.ok(await page.locator('.stage-book .motion-graph').count() >= 5, 'book graphs are present');
        for (const id of ['book-p8', 'book-p9', 'book-p10', 'book-p11']) {
          assert.match(await page.locator(`[data-graph-id="${id}"] .graph-label`).last().textContent(), /^d \(m\)/, `${id} keeps the book symbol d`);
        }
        await noMathErrors();
      }
      if (i === 7) assert.equal(await page.locator('.stage-test .question-card').count(), 0, 'final test is not authored before approval');
      if (i === 9) assert.equal(await page.locator('.note-card').count(), 9);
    }

    // أزرار فهرس الكتاب لا تكسر مسار المرحلة.
    await page.goto(`${base}#/lesson/motion-rest/book`);
    await page.locator('[data-scroll-to="book-speed"]').click();
    assert.ok(page.url().endsWith('#/lesson/motion-rest/book'));
    await noMathErrors();

    // المختبر: تغيير المرجع يغير الوصف، والقيم تتبع الزمن.
    await page.goto(`${base}#/lesson/motion-rest/activity`);
    await range(page, 'reference-time', 6);
    for (const [reference, expected] of [['sign', 'متحرك'], ['driver', 'ساكن'], ['passenger', 'ساكن']]) {
      await page.locator('[data-lab-input="reference"]').selectOption(reference);
      assert.equal((await page.locator('[data-reference-state]').innerText()).trim(), expected);
      assert.equal(await page.locator(`[data-reference-ring="${reference}"]`).count(), 1, `${reference} is visibly highlighted`);
      await assertBusInsideSvg(page);
    }
    assert.match(await page.locator('.lab-panel table').innerText(), /50/);
    const lineLength = Number(await page.locator('[data-distance-line]').getAttribute('data-pixel-length'));
    assert.ok(Math.abs(lineLength - 50 * 8.85) < 1e-9, 'distance line uses the same numeric scale');
    await page.locator('[data-lab-input="reference"]').selectOption('sign');
    await page.locator('[data-lab-action="ref-answer-yes"]').click();
    assert.equal(await page.locator('.inference .answer-feedback.correct').count(), 1);

    // تتبع المسار وتصنيفه.
    await page.locator('[data-lab-action="tab-path"]').click();
    await page.locator('[data-lab-action="path-mode-curved"]').click();
    await range(page, 'path-time', 3);
    await page.locator('[data-lab-action="path-answer-curved"]').click();
    assert.match(await page.locator('.inference .answer-feedback').innerText(), /تصنيف صحيح/);
    assert.match(await page.locator('.lab-panel table').innerText(), /3/);

    // الرسم والجدول والسرعة الوسطية في الحركة المنتظمة والسكون وغير المنتظمة.
    await page.locator('[data-lab-action="tab-graph"]').click();
    await range(page, 'graph-time', 4);
    assert.match(await page.locator('[data-measure="position"]').textContent(), /70/);
    assert.match(await page.locator('[data-measure="distance"]').textContent(), /40/);
    assert.match(await page.locator('.lab-panel').innerText(), /10/);
    assert.match(await page.locator('[data-graph-id="lab-uniform"] .graph-label').last().textContent(), /^x \(m\)/);
    assert.match(await page.locator('.lab-panel table thead').textContent(), /x/);
    assert.match(await page.locator('.lab-panel table thead').textContent(), /d/);
    assert.equal(await page.locator('.current-data-row').count(), 1);
    await page.locator('[data-lab-action="graph-answer-متساوية"]').click();
    assert.equal(await page.locator('.inference .answer-feedback.correct').count(), 1);
    await page.locator('[data-lab-action="graph-mode-changing"]').click();
    await range(page, 'graph-time', 4);
    assert.match(await page.locator('[data-measure="position"]').textContent(), /16/);
    assert.match(await page.locator('[data-measure="distance"]').textContent(), /16/);
    assert.match(await page.locator('[data-graph-id="lab-changing"] .graph-label').last().textContent(), /^x \(m\)/);
    await page.locator('[data-lab-action="graph-answer-غير متساوية"]').click();
    assert.equal(await page.locator('.inference .answer-feedback.correct').count(), 1);
    await page.locator('[data-lab-action="graph-mode-rest"]').click();
    await range(page, 'graph-time', 7);
    assert.match(await page.locator('[data-measure="position"]').textContent(), /5/);
    assert.match(await page.locator('[data-measure="distance"]').textContent(), /0/);
    assert.match(await page.locator('[data-graph-id="lab-rest"] .graph-label').last().textContent(), /^x \(m\)/);
    await page.locator('[data-lab-action="graph-answer-تبقى صفراً"]').click();
    assert.equal(await page.locator('.inference .answer-feedback.correct').count(), 1);
    await page.locator('[data-lab-action="graph-reset"]').click();
    await page.locator('[data-lab-action="graph-play"]').click();
    await page.waitForTimeout(450);
    assert.ok(Number(await page.locator('[data-lab-input="graph-time"]').inputValue()) > 0, 'play advances simulation time');
    await page.locator('[data-lab-action="graph-play"]').click();
    await noOverflow('interactive lab');

    // التغذية الراجعة التفسيرية والتدريب المتدرج.
    await page.goto(`${base}#/lesson/motion-rest/questions`);
    await page.locator('[data-qid="u-reference"][data-value="متحرك"]').click();
    assert.equal(await page.locator('[data-question-card="u-reference"] .answer-feedback.incorrect').count(), 1);
    await page.locator('[data-qid="u-reference"][data-value="ساكن"]').click();
    assert.match(await page.locator('[data-question-card="u-reference"] .answer-feedback.correct').innerText(), /لا يتغيّر موضع الراكب/);
    await page.goto(`${base}#/lesson/motion-rest/practice`);
    await page.locator('[data-match-select="path"]').selectOption('المسار');
    await page.locator('[data-match-select="speed"]').selectOption('السرعة الوسطية');
    await page.locator('[data-match-select="distance"]').selectOption('المسافة');
    await page.locator('[data-check-matching]').click();
    assert.match(await page.locator('.practice-level').first().innerText(), /3 من 3/);
    await page.locator('[data-qid="tf-1"][data-value="صح"]').click();
    assert.match(await page.locator('[data-question-card="tf-1"] .answer-feedback.incorrect').innerText(), /بالجسم المرجع/);
    await page.locator('[data-qid="tf-1"][data-value="خطأ"]').click();
    assert.equal(await page.locator('[data-question-card="tf-1"] .answer-feedback.correct').count(), 1);
    await page.locator('#input-boat-kmh').fill('٣٦');
    await page.locator('[data-check-numeric="boat-kmh"]').click();
    assert.equal(await page.locator('[data-numeric-card="boat-kmh"] .answer-feedback.correct').count(), 1);
    await page.locator('#input-child-distance').fill('0');
    await page.locator('[data-check-numeric="child-distance"]').click();
    assert.match(await page.locator('[data-numeric-card="child-distance"] .answer-feedback.incorrect').innerText(), /1800/);
    await noOverflow('practice');

    // لوحة المفاتيح وتقليل الحركة.
    await page.goto(base);
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement?.dataset.skip !== undefined), true);
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'main');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.btn')).transitionDuration), '0s');
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');

    // المقاسات الأربعة على الصفحات الأكثف: الوحدة والكتاب والمختبر والأمثلة والدفتر.
    if (process.env.SCREENSHOTS === '1') mkdirSync('artifacts/screenshots', { recursive: true });
    for (const [width, height] of viewports) {
      await page.setViewportSize({ width, height });
      for (const [name, hash] of [['home', ''], ['unit', '#/unit/motion'], ['book', '#/lesson/motion-rest/book'], ['activity', '#/lesson/motion-rest/activity'], ['examples', '#/lesson/motion-rest/examples'], ['notebook', '#/lesson/motion-rest/notebook']]) {
        await page.goto(`${base}${hash}`, { waitUntil: 'domcontentloaded' });
        await noOverflow(`${name} responsive`);
        await noMathErrors();
        if (name === 'activity') {
          await page.locator('[data-lab-action="tab-reference"]').click();
          await page.locator('[data-lab-input="reference"]').selectOption('passenger');
          await range(page, 'reference-time', 6);
          assert.equal((await page.locator('[data-reference-state]').innerText()).trim(), 'ساكن');
          await assertBusInsideSvg(page);
          await page.locator('[data-lab-input="reference"]').selectOption('sign');
          assert.equal((await page.locator('[data-reference-state]').innerText()).trim(), 'متحرك');
          await assertBusInsideSvg(page);
        }
        if (name === 'activity' && process.env.SCREENSHOTS === '1') {
          await page.locator('.lab-tabs').evaluate(element => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 16));
          await page.screenshot({ path: `artifacts/screenshots/activity-${width}x${height}.png`, fullPage: false });
        }
        if (name === 'examples' && width === 1366 && process.env.SCREENSHOTS === '1') {
          await page.locator('.worked-solution, .solution-steps').first().evaluate(element => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 16));
          await page.screenshot({ path: 'artifacts/screenshots/katex-examples-1366x768.png', fullPage: false });
        }
      }
    }

    // خطوط KaTeX محلية وتعمل فعلياً في نسخة التطوير ونسخة الإنتاج.
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(`${base}#/lesson/motion-rest/book`, { waitUntil: 'networkidle' });
    assert.ok(await page.evaluate(() => document.fonts.check('16px KaTeX_Main')), 'KaTeX_Main font is loaded');
    assert.ok(katexFontResponses.length > 0, 'KaTeX font files were requested successfully');
    assert.equal(await page.locator('.math-fallback').count(), 0);
    assert.deepEqual(localFailures, [], 'no local production/development asset failed');
    assert.deepEqual(errors, [], 'no browser JavaScript errors');
    console.log(`Browser checks passed (${production ? 'production' : 'development'}); KaTeX font responses: ${katexFontResponses.length}; viewports: ${viewports.map(size => size.join('×')).join(', ')}`);
  } finally {
    await browser?.close();
    server.kill();
  }
});
