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
const stageTitles = ['اكتشاف وتمهيد', 'محتوى الكتاب', 'شرح مبسط وموسع', 'أمثلة مفصلة', 'نشاط أو محاكاة', 'أسئلة لفهم الطالب', 'تدريب متدرج', 'ملخص الدرس', 'دفتر الطالب'];

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

test('Chromium: navigation, nine stages, real lab, assessments, KaTeX and four responsive sizes', { timeout: 300000 }, async () => {
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
    assert.equal(await page.locator('.header-engineer').innerText(), 'المهندس سومر شاهين · 0930215022');
    for (const [label, hash] of [['منطقة الاختبارات', '#/assessments']]) {
      await page.goto(`${base}${hash}`);
      assert.equal(await page.locator('.main-nav a', { hasText: label }).count(), 1);
      assert.equal(await page.locator('[role=tablist]').count() > 0, true);
      await noOverflow(label);
    }
    await page.goto(base);
    assert.equal(await page.locator('.main-nav a', { hasText: 'الوحدة الأولى: الحركة والتحريك' }).count(), 1);
    await page.locator('.main-nav a', { hasText: 'الوحدة الأولى: الحركة والتحريك' }).click();
    await page.waitForURL(/#\/unit\/motion$/);
    await page.waitForFunction(() => document.querySelector('main h1')?.textContent === 'الوحدة الأولى: الحركة والتحريك');
    assert.equal((await page.locator('main h1').innerText()).trim(), 'الوحدة الأولى: الحركة والتحريك');
    assert.equal(await page.locator('.path-list > li').count(), 3);
    const lessonCards = page.locator('.lesson-card');
    for (const [index, title] of ['الحركة والسكون', 'القوة والحركة', 'القوى على حامل واحد'].entries()) {
      assert.match(await lessonCards.nth(index).innerText(), new RegExp(title));
    }
    assert.equal(await page.evaluate(() => document.activeElement?.tagName), 'H1');
    await noOverflow('unit');

    // الدخول إلى الدرس والتنقل المتتابع بين المراحل التسع.
    await page.locator('.lesson-card[href="#/lesson/motion-rest"]').click();
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
      if (i === 8) assert.equal(await page.locator('.note-card').count(), 9);
    }

    // أزرار فهرس الكتاب لا تكسر مسار المرحلة.
    await page.goto(`${base}#/lesson/motion-rest/book`);
    await page.locator('[data-book-tab="book-speed"]').click();
    assert.equal(await page.locator('#book-speed').isVisible(), true);
    assert.equal(await page.locator('#book-start').isVisible(), false);
    assert.equal(await page.locator('[data-book-tab="book-speed"]').getAttribute('aria-selected'), 'true');
    await page.locator('[data-book-tab="book-speed"]').press('ArrowLeft');
    assert.equal(await page.locator('[data-book-tab="book-application"]').getAttribute('aria-selected'), 'true');
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

    // الدرس الثاني: القوة والحركة — التنقل بين المراحل التسع نفسها.
    await page.goto(`${base}#/lesson/force-motion`);
    await page.locator('#stage-title').waitFor();
    assert.equal((await page.locator('main h1').innerText()).trim(), 'القوة والحركة');
    for (let i = 0; i < stageTitles.length; i++) {
      const link = page.locator('.stage-nav ol a').nth(i);
      if (i) await link.click();
      await page.waitForFunction(index => document.querySelectorAll('.stage-nav ol a')[index]?.getAttribute('aria-current') === 'step', i);
      assert.equal((await page.locator('#stage-title').innerText()).trim(), stageTitles[i]);
      await noOverflow(`force stage ${i + 1}`);
    }
    if (process.env.SCREENSHOTS === '1') await page.screenshot({ path: 'artifacts/screenshots/force-discover.png', fullPage: false });

    // تبويبات محتوى الكتاب في الدرس الثاني مع معادلات KaTeX.
    await page.goto(`${base}#/lesson/force-motion/book`);
    await page.locator('[data-book-tab="force-relation"]').click();
    assert.equal(await page.locator('#force-relation').isVisible(), true);
    assert.equal(await page.locator('#force-start').isVisible(), false);
    assert.ok(await page.locator('.stage-book .katex').count() > 20, 'force book equations use KaTeX');
    await page.locator('[data-book-tab="force-relation"]').press('ArrowLeft');
    assert.equal(await page.locator('[data-book-tab="force-review"]').getAttribute('aria-selected'), 'true');
    await noMathErrors();

    // مختبر القوة: عناصر القوة تتغير بالتحكم، والكتلة والثقل يتبعان المنطقة، والرسم بالمقياس.
    await page.goto(`${base}#/lesson/force-motion/activity`);
    await page.waitForSelector('#force-lab', { state: 'attached' });
    assert.deepEqual(errors, [], 'no browser errors before exercising the force lab');
    await range(page, 'force', 8);
    assert.ok((await page.locator('.force-lab .force-scene-svg').textContent()).includes('F = 8 N'), 'arrow label follows the slider');
    await page.locator('[data-lab-input="point"]').selectOption('back');
    assert.match(await page.locator('.force-lab .force-readout').innerText(), /مؤخرة السيارة/);
    await page.locator('[data-lab-action="elements-answer-more"]').click();
    assert.equal(await page.locator('.force-lab .answer-feedback.correct').count(), 1);
    await page.locator('[data-lab-action="tab-weight"]').click();
    await range(page, 'mass', 0.1);
    assert.match(await page.locator('.force-lab').innerText(), /0\.98/);
    await page.locator('[data-lab-input="region"]').selectOption('pole');
    assert.match(await page.locator('.force-lab').innerText(), /0\.983/);
    await page.locator('[data-lab-action="weight-answer-mass"]').click();
    assert.equal(await page.locator('.force-lab .answer-feedback.correct').count(), 1);
    await page.locator('[data-lab-action="tab-draw"]').click();
    await range(page, 'draw-length', 4);
    await page.locator('[data-lab-action="draw-check"]').click();
    assert.match(await page.locator('.force-lab .answer-feedback').innerText(), /رسم صحيح/);
    await noOverflow('force lab');

    // أسئلة الفهم والتدريب المتدرج في الدرس الثاني.
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
    await page.locator('#input-fm-num-ball').fill('10');
    await page.locator('[data-check-numeric="fm-num-ball"]').click();
    assert.match(await page.locator('[data-numeric-card="fm-num-ball"] .answer-feedback.incorrect').innerText(), /0\.1×10=1/);
    await noOverflow('force practice');

    // منطقة المعلم: بوابة شكلية قبل أي محتوى، ثم الحلول، ثم تسجيل الخروج، دون تأثير في بقية الصفحات.
    const teacherSubmit = page.locator('[data-teacher-login] button[type="submit"]');
    await page.goto(`${base}#/student`);
    await page.locator('.main-nav a', { hasText: 'منطقة المعلم' }).click();
    await page.waitForSelector('[data-teacher-login]');
    assert.equal((await page.locator('main h1').innerText()).trim(), 'منطقة المعلم');
    assert.equal(await page.evaluate(() => document.activeElement?.tagName), 'H1', 'focus on the gate heading when opening the zone');
    assert.equal(await page.locator('#teacher-password').getAttribute('type'), 'password');
    assert.equal((await teacherSubmit.innerText()).trim(), 'دخول');
    assert.equal(await page.locator('.solution-question').count(), 0, 'no solution is rendered before the password');
    assert.equal(await page.locator('[data-teacher-logout]').count(), 0);
    assert.doesNotMatch(await page.locator('main').innerText(), /السؤال الأول|المسألة الأولى|الجواب:/);
    await noOverflow('teacher gate');

    await page.locator('#teacher-password').fill('somer174');
    await teacherSubmit.click();
    await page.waitForSelector('.gate-error:not([hidden])');
    assert.match(await page.locator('.gate-error').innerText(), /كلمة المرور غير صحيحة/);
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'teacher-password', 'focus returns to the password field');
    assert.equal(await page.locator('.solution-question').count(), 0, 'wrong password keeps content hidden');

    await page.locator('#teacher-password').fill('');
    await teacherSubmit.click();
    await page.waitForFunction(() => /أدخل كلمة المرور/.test(document.querySelector('.gate-error')?.textContent || ''));
    assert.equal(await page.locator('.solution-question').count(), 0);

    await page.locator('#teacher-password').fill('somer173');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-teacher-logout]');
    assert.equal(await page.locator('[data-teacher-login]').count(), 0, 'gate disappears after the correct password');
    assert.equal(await page.locator('.gate-error').count(), 0);
    assert.equal((await page.locator('main h1').innerText()).trim(), 'حلول أسئلة نهاية الدروس');
    assert.equal(await page.evaluate(() => document.activeElement?.tagName), 'H1', 'focus moves to the solutions heading');
    assert.equal(await page.locator('.teacher-unit h2').innerText(), 'الوحدة الأولى: الحركة والتحريك');
    assert.equal((await page.locator('.teacher-zone [role="tab"][aria-selected="true"]').innerText()).trim(), 'الحركة والسكون');
    const solutionTitles = await page.locator('.teacher-zone [role="tabpanel"]:not([hidden]) .solution-question h4').allInnerTexts();
    assert.deepEqual(solutionTitles.map(title => title.trim()), ['السؤال الأول', 'السؤال الثاني', 'السؤال الثالث', 'السؤال الرابع']);
    await page.locator('#teacher-tab-motion-force-motion').click();
    const forceSolutionTitles = await page.locator('.teacher-zone [role="tabpanel"]:not([hidden]) .solution-question h4').allInnerTexts();
    assert.deepEqual(forceSolutionTitles.map(title => title.trim()), ['السؤال الأول', 'السؤال الثاني', 'السؤال الثالث', 'السؤال الرابع', 'السؤال الخامس']);
    await page.locator('#teacher-tab-motion-motion-rest').click();
    const solutionText = await page.locator('.teacher-zone').innerText();
    assert.match(solutionText, /المسار/);
    assert.match(solutionText, /السرعة الوسطية/);
    assert.match(solutionText, /المسافة/);
    assert.match(solutionText, /10 m·s⁻¹/);
    assert.match(solutionText, /200 m/);
    assert.match(solutionText, /18 min/);
    assert.match(solutionText, /3\.75 km/);
    assert.match(solutionText, /1800 m/);
    assert.match(solutionText, /2 m·s⁻¹/);
    assert.doesNotMatch(solutionText, /لا توجد حلول معروضة|لم تتوفر نسخة موثقة|لم يُنشأ/);
    assert.ok(await page.locator('.teacher-zone .katex').count() >= 12, 'solution formulas render with KaTeX');
    assert.equal(await page.locator('.math-fallback').count(), 0);
    assert.equal(await page.locator('.teacher-zone .formula').first().getAttribute('dir'), 'ltr');
    await page.locator('.solution-chip', { hasText: 'السؤال الرابع' }).click();
    await page.waitForFunction(() => {
      const target = document.getElementById('solution-motion-rest-q4')?.getBoundingClientRect();
      return target && target.top < innerHeight && target.bottom > 0;
    });
    await page.locator('[data-teacher-logout]').click();
    await page.waitForSelector('[data-teacher-login]');
    assert.equal(await page.locator('.solution-question').count(), 0, 'logout hides every solution');
    assert.equal(await page.evaluate(() => document.activeElement?.tagName), 'H1');

    // مغادرة المنطقة تقفلها: العودة تعرض بوابة الدخول من جديد.
    await page.locator('.main-nav a', { hasText: 'منطقة الاختبارات' }).click();
    await page.waitForFunction(() => document.querySelector('main h1')?.textContent === 'اختبارات الدروس');
    await page.locator('.main-nav a', { hasText: 'منطقة المعلم' }).click();
    await page.waitForSelector('[data-teacher-login]');
    assert.equal(await page.locator('.solution-question').count(), 0, 'returning to the zone requires the password again');
    await page.locator('#teacher-password').fill('somer173');
    await teacherSubmit.click();
    await page.waitForSelector('[data-teacher-logout]');
    await page.locator('.main-nav a', { hasText: 'الوحدة الأولى: الحركة والتحريك' }).click();
    await page.waitForFunction(() => document.querySelector('main h1')?.textContent === 'الوحدة الأولى: الحركة والتحريك');
    assert.equal(await page.locator('.solution-question, [data-teacher-login], .teacher-gate').count(), 0, 'leaving the zone removes it from the DOM');
    await page.goto(`${base}#/lesson/motion-rest/book`);
    assert.equal(await page.locator('.solution-question, [data-teacher-login], .teacher-gate').count(), 0);
    await page.goto(`${base}#/teacher`);
    await page.waitForSelector('[data-teacher-login]');
    await page.goto(`${base}#/`);
    await noOverflow('home after teacher zone');

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
      for (const [name, hash] of [['home', ''], ['unit', '#/unit/motion'], ['book', '#/lesson/motion-rest/book'], ['activity', '#/lesson/motion-rest/activity'], ['examples', '#/lesson/motion-rest/examples'], ['notebook', '#/lesson/motion-rest/notebook'], ['force-book', '#/lesson/force-motion/book'], ['force-activity', '#/lesson/force-motion/activity'], ['assessments', '#/assessments'], ['teacher', '#/teacher']]) {
        await page.goto(`${base}${hash}`, { waitUntil: 'domcontentloaded' });
        await noOverflow(`${name} responsive`);
        assert.equal(await page.locator('.header-engineer').innerText(), 'المهندس سومر شاهين · 0930215022', 'engineer identity remains visible at every viewport');
        if (name === 'teacher') {
          await page.waitForSelector('[data-teacher-login]');
          assert.equal(await page.locator('.solution-question').count(), 0, 'gate hides solutions at every viewport');
          if (process.env.SCREENSHOTS === '1') {
            mkdirSync('artifacts/screenshots', { recursive: true });
            await page.screenshot({ path: `artifacts/screenshots/teacher-gate-${width}x${height}.png`, fullPage: false });
          }
          await page.locator('#teacher-password').fill('somer173');
          await page.locator('[data-teacher-login] button[type="submit"]').click();
          await page.waitForSelector('[data-teacher-logout]');
          await noOverflow('teacher solutions responsive');
          if (process.env.SCREENSHOTS === '1') {
            await page.screenshot({ path: `artifacts/screenshots/teacher-solutions-${width}x${height}.png`, fullPage: false });
          }
        }
        if (name === 'assessments' || name === 'teacher') {
          const tab = page.locator('[role="tab"]').first();
          assert.equal(await tab.isVisible(), true, `${name} has a visible independent tab`);
          await tab.click();
          assert.equal(await page.locator('[role="tabpanel"]').first().isVisible(), true);
        }
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
