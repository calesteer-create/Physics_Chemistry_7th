/**
 * اختبارات P1-4b — جلسة الطالب الموقّعة وملكية بيانات الطالب.
 *
 * تُثبت أن:
 * 1) غياب `STUDENT_SESSION_SECRET` (أو قصوره، أو اشتقاقه من أسرار المعلم أو
 *    قاعدة البيانات) يُقفل الباب بالكامل: لا إصدار ولا قبول ولا ملكية.
 * 2) الرمز الموقَّع وحده هو مصدر الهوية: كل تعديل على التوقيع أو المعرّف أو
 *    النسخة أو الصلاحية يُرفض (تزوير).
 * 3) الرمز المنتهي أو ذا الصلاحية المبالغ فيها يُرفض.
 * 4) **الملكية**: معرّف الطالب يأتي من الجلسة الموقّعة فقط، ولا يُقبل معرّف
 *    يرسله المتصفح (الكوكي القديم `student_id` مثلاً).
 * 5) **العزل**: طالب لا يصل إلى بيانات طالب آخر، ولا يملك سجلّاً غير موجود.
 *
 * القيم المستخدمة هنا وهمية بحتة، ولا تُفتح أيّ قاعدة بيانات.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  LEGACY_STUDENT_COOKIE,
  STUDENT_SESSION_COOKIE,
  STUDENT_SESSION_TTL_MS,
  createStudentSessionToken,
  isValidStudentUuid,
  resolveStudentSession,
  studentSessionConfigured,
  studentSessionCookieOptions,
  studentSessionSecret,
  verifyStudentSessionToken,
  type StudentRecord,
} from "../../src/lib/student-session";

// قيم اختبار وهمية بحتة — ليست أسراراً حقيقية ولا تُستخدم للاتصال بأي خدمة.
const TEST_SECRET = "p1-4b-test-only-not-a-real-secret-0123456789abcdef";
const OTHER_SECRET = "p1-4b-other-test-only-not-a-real-secret-fedcba9876543210";
const TEACHER_TEST_SECRET = "p1-4b-teacher-test-only-not-a-real-secret-abcdef123456";
const TEST_PASSWORD = "p1-4b-test-password";
const TEST_DB_URL = "postgresql://placeholder:placeholder@127.0.0.1:5432/not-a-real-db";

const STUDENT_A = "11111111-1111-4111-8111-111111111111";
const STUDENT_B = "22222222-2222-4222-8222-222222222222";
const STUDENT_UNKNOWN = "33333333-3333-4333-8333-333333333333";

const ENV_KEYS = [
  "STUDENT_SESSION_SECRET",
  "TEACHER_SESSION_SECRET",
  "TEACHER_PASSWORD",
  "DATABASE_URL",
  "NODE_ENV",
] as const;

interface AfterCapable {
  after(fn: () => void): void;
}

/** حارس واحد لكل اختبار، فيسمح بتغيير البيئة أكثر من مرة داخل الاختبار نفسه. */
function envGuard(t: AfterCapable): void {
  // Next.js يعلن NODE_ENV كقيمة للقراءة فقط — ن widen النوع لتغييره في الاختبار.
  const env = process.env as Record<string, string | undefined>;
  const previous = ENV_KEYS.map((key) => [key, env[key]] as const);
  t.after(() => {
    for (const [key, value] of previous) {
      if (value === undefined) delete env[key];
      else env[key] = value;
    }
  });
}

function apply(values: Record<string, string | undefined>): void {
  const env = process.env as Record<string, string | undefined>;
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete env[key];
    else env[key] = value;
  }
}

function configured(secret: string = TEST_SECRET): void {
  apply({
    STUDENT_SESSION_SECRET: secret,
    TEACHER_SESSION_SECRET: TEACHER_TEST_SECRET,
    TEACHER_PASSWORD: TEST_PASSWORD,
    DATABASE_URL: TEST_DB_URL,
  });
}

/** يبني سجلّ طالب وهمياً (بلا قاعدة بيانات). */
function record(id: string, name: string): StudentRecord {
  return { id, name, createdAt: new Date(0) };
}

/** قاعدة بيانات وهمية: طالبان فقط. */
function lookupOf(...rows: StudentRecord[]) {
  return async (studentId: string): Promise<StudentRecord | null> =>
    rows.find((row) => row.id === studentId) ?? null;
}

/** يزوّر رمزاً بتوقيع صحيح تحت أي سرّ ونحوٍل. */
function forge(secret: string, studentId: string, expiryMs: number = Date.now() + 3_600_000): string {
  const payload = `v1.${studentId}.${expiryMs}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

/* ───────────────────────── الإعدادات ───────────────────────── */

test("غياب STUDENT_SESSION_SECRET: لا يُصدر رمز، ولا تُقبل جلسة، ولا ملكية", async (t) => {
  envGuard(t);
  apply({ STUDENT_SESSION_SECRET: undefined });
  assert.equal(studentSessionSecret(), null);
  assert.equal(studentSessionConfigured(), false);
  await assert.rejects(() => createStudentSessionToken(STUDENT_A));

  // رمز مُوقَّع فعلاً — لكن بلا سرّ مضبوط يُرفض (fail closed).
  const token = forge(TEST_SECRET, STUDENT_A);
  const verified = await verifyStudentSessionToken(token);
  assert.equal(verified.ok, false);
  if (!verified.ok) assert.equal(verified.reason, "not-configured");

  const resolution = await resolveStudentSession(token, lookupOf(record(STUDENT_A, "أ")));
  assert.equal(resolution.ok, false);
  if (!resolution.ok) assert.equal(resolution.reason, "not-configured");
});

test("السرّ القصير (أقل من 32 محرفاً) مرفوض كإعداد", (t) => {
  envGuard(t);
  apply({ STUDENT_SESSION_SECRET: "too-short" });
  assert.equal(studentSessionSecret(), null);
  assert.equal(studentSessionConfigured(), false);
});

test("سرّ الطالب مساوٍ لسرّ المعلم أو كلمة المرور أو DATABASE_URL أو مشتقّ ⇒ مرفوض", (t) => {
  envGuard(t);
  apply({ STUDENT_SESSION_SECRET: TEACHER_TEST_SECRET, TEACHER_SESSION_SECRET: TEACHER_TEST_SECRET });
  assert.equal(studentSessionSecret(), null);

  apply({ STUDENT_SESSION_SECRET: TEST_PASSWORD, TEACHER_PASSWORD: TEST_PASSWORD });
  assert.equal(studentSessionSecret(), null);

  apply({ STUDENT_SESSION_SECRET: TEST_DB_URL, DATABASE_URL: TEST_DB_URL });
  assert.equal(studentSessionSecret(), null);

  apply({ STUDENT_SESSION_SECRET: `derived:${TEST_DB_URL}` });
  assert.equal(studentSessionSecret(), null);
});

test("سرّ الطالب وسرّ المعلم مستقلّان: سرّ المعلم لا يُقبل لطالب", (t) => {
  envGuard(t);
  configured();
  assert.equal(studentSessionSecret(), TEST_SECRET);
  assert.notEqual(studentSessionSecret(), TEACHER_TEST_SECRET);
});

test("رمز موقَّع بسرّ المعلم لا يمنح جلسة طالب", async (t) => {
  envGuard(t);
  configured();
  const token = forge(TEACHER_TEST_SECRET, STUDENT_A);
  const verified = await verifyStudentSessionToken(token);
  assert.equal(verified.ok, false);
  if (!verified.ok) assert.equal(verified.reason, "bad-signature");
});

/* ───────────────────────── التوقيع ───────────────────────── */

test("الحالة المسموحة: إصدار رمز v1 والتحقق منه ينجحان", async (t) => {
  envGuard(t);
  configured();
  const { token, maxAge } = await createStudentSessionToken(STUDENT_A);
  assert.match(token, /^v1\.[0-9a-f-]{36}\.\d+\.[0-9a-f]{64}$/);
  assert.equal(maxAge, STUDENT_SESSION_TTL_MS / 1000);
  const verified = await verifyStudentSessionToken(token);
  assert.equal(verified.ok, true);
  if (verified.ok) assert.equal(verified.studentId, STUDENT_A);
});

test("التزوير: تعديل التوقيع أو تبديل المعرّف أو تغيير النسخة أو نقص الأجزاء مرفوض", async (t) => {
  envGuard(t);
  configured();
  const { token } = await createStudentSessionToken(STUDENT_A);

  const tampered = `${token.slice(0, -1)}${token.endsWith("0") ? "1" : "0"}`;
  assert.equal((await verifyStudentSessionToken(tampered)).ok, false);

  // تبديل المعرّف مع إبقاء التوقيع: لا يمرّ.
  const swapped = token.replace(STUDENT_A, STUDENT_B);
  const swappedResult = await verifyStudentSessionToken(swapped);
  assert.equal(swappedResult.ok, false);
  if (!swappedResult.ok) assert.equal(swappedResult.reason, "bad-signature");

  assert.equal((await verifyStudentSessionToken(token.replace("v1.", "v2."))).ok, false);
  assert.equal((await verifyStudentSessionToken(token.replace("v1.", "v0."))).ok, false);
  assert.equal((await verifyStudentSessionToken(token.slice(0, token.lastIndexOf(".")))).ok, false);
  assert.equal((await verifyStudentSessionToken("")).ok, false);
  assert.equal((await verifyStudentSessionToken(undefined)).ok, false);
  assert.equal((await verifyStudentSessionToken(null)).ok, false);
});

test("المعرّف داخل الرمز يجب أن يكون UUID صحيحاً", async (t) => {
  envGuard(t);
  configured();
  const notUuid = await verifyStudentSessionToken(forge(TEST_SECRET, "not-a-uuid"));
  assert.equal(notUuid.ok, false);
  if (!notUuid.ok) assert.equal(notUuid.reason, "invalid-uuid");

  const nilUuid = await verifyStudentSessionToken(forge(TEST_SECRET, "00000000-0000-0000-0000-000000000000"));
  assert.equal(nilUuid.ok, false);
  if (!nilUuid.ok) assert.equal(nilUuid.reason, "invalid-uuid");

  assert.equal(isValidStudentUuid(STUDENT_A), true);
  assert.equal(isValidStudentUuid("11111111-1111-1111-1111-111111111111"), false);
  assert.equal(isValidStudentUuid(""), false);
  assert.equal(isValidStudentUuid(null), false);
});

test("انتهاء الصلاحية مرفوض، وكذلك الصلاحية المبالغ فيها", async (t) => {
  envGuard(t);
  configured();

  const expired = await createStudentSessionToken(STUDENT_A, Date.now() - STUDENT_SESSION_TTL_MS - 1000);
  const expiredResult = await verifyStudentSessionToken(expired.token);
  assert.equal(expiredResult.ok, false);
  if (!expiredResult.ok) assert.equal(expiredResult.reason, "expired");

  const tooFar = forge(TEST_SECRET, STUDENT_A, Date.now() + STUDENT_SESSION_TTL_MS + 10 * 60_000);
  const tooFarResult = await verifyStudentSessionToken(tooFar);
  assert.equal(tooFarResult.ok, false);
  if (!tooFarResult.ok) assert.equal(tooFarResult.reason, "expiry-out-of-range");
});

test("رمز صالح يُرفض فوراً إذا أُزيل سرّ الجلسات", async (t) => {
  envGuard(t);
  configured();
  const { token } = await createStudentSessionToken(STUDENT_A);
  assert.equal((await verifyStudentSessionToken(token)).ok, true);

  apply({ STUDENT_SESSION_SECRET: undefined });
  assert.equal((await verifyStudentSessionToken(token)).ok, false);
});

test("تدوير سرّ التوقيع يُبطل الرموز القديمة ويقبل الرموز الجديدة", async (t) => {
  envGuard(t);
  configured();
  const { token } = await createStudentSessionToken(STUDENT_A);
  apply({ STUDENT_SESSION_SECRET: OTHER_SECRET });
  assert.equal((await verifyStudentSessionToken(token)).ok, false);
  assert.equal((await verifyStudentSessionToken(forge(TEST_SECRET, STUDENT_A))).ok, false);
  const rotated = await createStudentSessionToken(STUDENT_A);
  assert.equal((await verifyStudentSessionToken(rotated.token)).ok, true);
});

/* ───────────────────────── الملكية ───────────────────────── */

test("الملكية تأتي من الجلسة الموقّعة وحدها: كوكي المتصفح القديم لا يُقبل", async (t) => {
  envGuard(t);
  configured();

  // قيمة الكوكي القديمة (UUID خام بلا توقيع) — لا تُقبل كجلسة إطلاقاً.
  assert.equal((await verifyStudentSessionToken(STUDENT_A)).ok, false);
  const legacy = await resolveStudentSession(STUDENT_A, lookupOf(record(STUDENT_A, "أ")));
  assert.equal(legacy.ok, false);
  if (!legacy.ok) assert.equal(legacy.reason, "malformed");
  assert.equal(LEGACY_STUDENT_COOKIE, "student_id");
  assert.equal(STUDENT_SESSION_COOKIE, "student_session");
});

test("الملكية: معرّف من المتصفح لا يُترجم إلى ملكية، والرمز الموقَّع وحده هو المصدر", async (t) => {
  envGuard(t);
  configured();
  const lookup = lookupOf(record(STUDENT_A, "طالب أ"), record(STUDENT_B, "طالب ب"));

  const { token } = await createStudentSessionToken(STUDENT_A);
  const resolution = await resolveStudentSession(token, lookup);
  assert.equal(resolution.ok, true);
  if (resolution.ok) {
    assert.equal(resolution.studentId, STUDENT_A);
    assert.equal(resolution.student.id, STUDENT_A);
    assert.equal(resolution.student.name, "طالب أ");
  }
});

test("العزل: طالب (أ) لا يصل إلى بيانات طالب (ب)، ولا يملك سجلّاً غير موجود", async (t) => {
  envGuard(t);
  configured();
  const lookup = lookupOf(record(STUDENT_A, "طالب أ"), record(STUDENT_B, "طالب ب"));

  // جلسة صحيحة لطالب (أ) ⇒ يملك (أ) فقط.
  const tokenA = (await createStudentSessionToken(STUDENT_A)).token;
  const asA = await resolveStudentSession(tokenA, lookup);
  assert.equal(asA.ok, true);
  if (asA.ok) {
    assert.equal(asA.studentId, STUDENT_A);
    assert.notEqual(asA.studentId, STUDENT_B);
    assert.equal(asA.student.name, "طالب أ");
  }

  // رمز مزوّر باسم (ب) لكن بتوقيع خاطئ ⇒ لا ملكية.
  const forgedB = forge(OTHER_SECRET, STUDENT_B);
  const asForgedB = await resolveStudentSession(forgedB, lookup);
  assert.equal(asForgedB.ok, false);
  if (!asForgedB.ok) assert.equal(asForgedB.reason, "bad-signature");

  // رمز موقَّع صحيح لطالب غير موجود في القاعدة ⇒ لا ملكية.
  const unknown = await resolveStudentSession(
    (await createStudentSessionToken(STUDENT_UNKNOWN)).token,
    lookup,
  );
  assert.equal(unknown.ok, false);
  if (!unknown.ok) assert.equal(unknown.reason, "student-not-found");

  // فشل البحث في القاعدة ⇒ لا ملكية (fail closed).
  const failed = await resolveStudentSession(tokenA, async () => {
    throw new Error("database is down");
  });
  assert.equal(failed.ok, false);
  if (!failed.ok) assert.equal(failed.reason, "lookup-failed");
});

test("إعدادات الكوكي: HttpOnly و SameSite=Lax و Path=/ و Secure في الإنتاج", (t) => {
  envGuard(t);
  apply({ NODE_ENV: "development" });
  const dev = studentSessionCookieOptions(600);
  assert.equal(dev.httpOnly, true);
  assert.equal(dev.secure, false);
  assert.equal(dev.sameSite, "lax");
  assert.equal(dev.path, "/");
  assert.equal(dev.maxAge, 600);

  apply({ NODE_ENV: "production" });
  const prod = studentSessionCookieOptions(600);
  assert.equal(prod.secure, true);
  assert.equal(prod.httpOnly, true);
  assert.equal(prod.sameSite, "lax");
  assert.equal(prod.path, "/");
});
