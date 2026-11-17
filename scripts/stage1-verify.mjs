// HTTP integration tests. DATABASE_URL is a non-working placeholder for build only.
import { spawn, execFileSync } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import assert from 'node:assert/strict';

const port = Number(process.env.STAGE1_PORT || 3211);
const base = `http://127.0.0.1:${port}`;
const db = 'postgresql://placeholder:placeholder@127.0.0.1:5432/not-a-real-db';
const password = 'stage1-integration-password';
const secret = 'stage1-integration-test-only-not-a-real-secret-0123456789abcdef';
const oldSecret = 'insecure-dev-secret-change-me';
const answers = { q1: 0, q2: 0, q3: false, q4: 0, q5: 'x', q6: 0, q7: false, q8: 0, q9: 0, q10: 'x' };
const env = { ...process.env, DATABASE_URL: db };
delete env.TEACHER_PASSWORD;
delete env.TEACHER_SESSION_SECRET;
function check(name, actual, expected) { assert.equal(actual, expected, name); console.log(`PASS ${name}: ${actual}`); }
function forge(key, version = true) {
  const payload = `${version ? 'v2.' : ''}${Date.now() + 3600000}`;
  return `${payload}.${createHmac('sha256', key).update(payload).digest('hex')}`;
}
async function runServer(serverEnv, fn) {
  const proc = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port), '-H', '127.0.0.1'], { env: serverEnv, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = ''; proc.stdout.on('data', x => log += x); proc.stderr.on('data', x => log += x);
  try {
    // Wait for this process, not an unrelated service already listening on the port.
    for (let i = 0; i < 100 && !log.includes('✓ Ready'); i++) {
      if (proc.exitCode !== null) throw new Error(`server exited: ${log}`);
      await delay(100);
    }
    assert.ok(log.includes('✓ Ready'), `server not ready: ${log}`);
    await fn();
  } finally {
    if (proc.exitCode === null) { const done = new Promise(r => proc.once('exit', r)); proc.kill('SIGTERM'); await done; }
  }
}
const get = (path, cookie) => fetch(base + path, { redirect: 'manual', headers: cookie ? { cookie } : {}, signal: AbortSignal.timeout(10000) });
const post = (path, body, cookie) => fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body), signal: AbortSignal.timeout(10000) });
function noSecrets(body) {
  const raw = JSON.stringify(body);
  for (const marker of ['correctLabel', 'explain', 'لا، لأن المسار ليس مستقيماً', 'بسبب اختيار الحافلة كجسم مرجع']) assert.ok(!raw.includes(marker), `answer leak: ${marker}`);
}

console.log('Build with placeholder DATABASE_URL (not a database connectivity test)');
execFileSync('npm', ['run', 'build'], { env, stdio: 'inherit' });
await runServer(env, async () => {
  for (const [name, key, version] of [['old', oldSecret, true], ['database-derived', `derived:${db}`, true], ['password-derived', `derived:${password}`, true], ['legacy', oldSecret, false]]) {
    const r = await get('/teacher', `teacher_session=${forge(key, version)}`);
    check(`unconfigured /teacher ${name}`, r.status, 307);
  }
  const login = await post('/api/teacher/login', { password });
  check('unconfigured login', login.status, 503);
  for (const payload of [{ answers: {} }, { answers: { q1: 0 } }, { answers: null }]) {
    const r = await post('/api/quizzes/quiz-motion-1/submit', payload);
    check('incomplete submission', r.status, 400);
    const data = await r.json(); noSecrets(data); assert.ok(!('feedback' in data));
  }
  // Repeated, complete attempts varying one answer at a time must be indistinguishable,
  // including when a caller supplies an untrusted student cookie.
  const variants = [answers, { ...answers, q1: 1 }, { ...answers, q1: 2 },
    { ...answers, q3: true }, { ...answers, q5: 'candidate' }, answers];
  for (const cookie of [undefined, 'student_id=00000000-0000-4000-8000-000000000001']) {
    for (const candidate of variants) {
      const res = await post('/api/quizzes/quiz-motion-1/submit', { answers: candidate }, cookie);
      check('repeated complete submission', res.status, 200);
      const data = await res.json();
      assert.deepEqual(data, { ok: true });
      noSecrets(data);
    }
  }
  const page = await get('/quizzes/quiz-motion-1');
  check('quiz page', page.status, 200);
  const html = await page.text();
  for (const marker of ['correctLabel', 'explain', 'teacherNotes']) assert.ok(!html.includes(marker), `quiz page leak: ${marker}`);
});
await runServer({ ...env, TEACHER_PASSWORD: password, TEACHER_SESSION_SECRET: secret }, async () => {
  for (const [name, key, version] of [['old', oldSecret, true], ['database-derived', `derived:${db}`, true], ['password-derived', `derived:${password}`, true], ['legacy even with current key', secret, false]]) {
    const r = await get('/teacher', `teacher_session=${forge(key, version)}`);
    check(`configured /teacher ${name}`, r.status, 307);
  }
  check('incorrect password', (await post('/api/teacher/login', { password: 'wrong' })).status, 401);
  const login = await post('/api/teacher/login', { password });
  check('valid login', login.status, 200);
  const cookie = login.headers.get('set-cookie')?.split(';')[0];
  assert.ok(cookie?.startsWith('teacher_session=v2.'));
  const teacher = await get('/teacher', cookie);
  check('valid session /teacher', teacher.status, 200);
  assert.ok((await teacher.text()).includes('مفاتيح الإجابة والحلول التفصيلية'));
  const result = await post('/api/quizzes/quiz-motion-1/submit', { answers }, cookie);
  check('teacher complete submission', result.status, 200);
  assert.deepEqual(await result.json(), { ok: true });
});
const changed = execFileSync('git', ['diff', '--name-only', 'main', '--', 'src/content', 'src/components/lesson', 'src/components/figures', 'src/components/lab'], { encoding: 'utf8' }).trim();
check('educational content files unchanged', changed, '');
console.log('All stage 1 HTTP checks passed. No real database connection was tested.');
