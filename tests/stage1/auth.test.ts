/**
 * اختبارات المرحلة الأولى — P0-1: استحالة تزوير جلسة المعلم.
 *
 * تُثبت أن: السرّ الثابت القديم، والسرّ المشتق من TEACHER_PASSWORD، والسرّ
 * المشتق من DATABASE_URL، والصيغة القديمة للرمز، كلها مرفوضة؛ وأن غياب
 * إعدادات الأمان يُقفل الباب؛ وأن المسار المصرّح به يعمل.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  createTeacherSessionToken,
  teacherAuthConfigured,
  teacherSessionSecret,
  verifyTeacherSessionToken,
} from "../../src/lib/auth";

// قيم اختبار وهمية بحتة — ليست أسراراً حقيقية ولا تُستخدم للاتصال بأي خدمة.
const TEST_SECRET = "stage1-test-only-not-a-real-secret-0123456789abcdef";
const OTHER_SECRET = "stage1-other-test-only-not-a-real-secret-fedcba9876543210";
const TEST_PASSWORD = "stage1-test-password";
const TEST_DB_URL = "postgresql://placeholder:placeholder@127.0.0.1:5432/not-a-real-db";
const OLD_HARDCODED_SECRET = "insecure-dev-secret-change-me";
const ENV_KEYS = ["TEACHER_SESSION_SECRET", "TEACHER_PASSWORD", "DATABASE_URL"] as const;

interface AfterCapable {
  after(fn: () => void): void;
}

/** حارس واحد لكل اختبار، فيسمح بتغيير البيئة أكثر من مرة داخل الاختبار نفسه. */
function envGuard(t: AfterCapable): void {
  const previous = ENV_KEYS.map((key) => [key, process.env[key]] as const);
  t.after(() => {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

function apply(values: Record<string, string | undefined>): void {
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

function clearSecurity(): void {
  apply({ TEACHER_SESSION_SECRET: undefined, TEACHER_PASSWORD: undefined, DATABASE_URL: undefined });
}

function configured(secret: string = TEST_SECRET): void {
  apply({
    TEACHER_SESSION_SECRET: secret,
    TEACHER_PASSWORD: TEST_PASSWORD,
    DATABASE_URL: TEST_DB_URL,
  });
}

/** تزوير رمز بالصيغة القديمة `<expiry>.<sig>` أو الجديدة `v2.<expiry>.<sig>`. */
function forge(secret: string, versioned: boolean, expiryMs: number = Date.now() + 3_600_000): string {
  const payload = versioned ? `v2.${expiryMs}` : String(expiryMs);
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

test("غياب إعدادات الأمان: لا يُصدر رمز، ولا تُقبل جلسة، ويُرفض الوصول", async (t) => {
  envGuard(t);
  clearSecurity();
  assert.equal(teacherSessionSecret(), null);
  assert.equal(teacherAuthConfigured(), false);
  await assert.rejects(() => createTeacherSessionToken());
  assert.equal(await verifyTeacherSessionToken(forge(OLD_HARDCODED_SECRET, false)), false);
  assert.equal(await verifyTeacherSessionToken(forge(OLD_HARDCODED_SECRET, true)), false);
});

test("السرّ الثابت القديم لا يزوّر جلسة حتى مع اكتمال بقية الإعدادات", async (t) => {
  envGuard(t);
  configured();
  assert.equal(teacherAuthConfigured(), true);
  assert.equal(await verifyTeacherSessionToken(forge(OLD_HARDCODED_SECRET, true)), false);
  assert.equal(await verifyTeacherSessionToken(forge(OLD_HARDCODED_SECRET, false)), false);
});

test("الأسرار المشتقة من كلمة المرور أو DATABASE_URL لا تزوّر جلسة", async (t) => {
  envGuard(t);
  apply({
    TEACHER_SESSION_SECRET: undefined,
    TEACHER_PASSWORD: TEST_PASSWORD,
    DATABASE_URL: TEST_DB_URL,
  });
  assert.equal(teacherAuthConfigured(), false);
  for (const secret of [`derived:${TEST_PASSWORD}`, `derived:${TEST_DB_URL}`]) {
    assert.equal(await verifyTeacherSessionToken(forge(secret, false)), false);
    assert.equal(await verifyTeacherSessionToken(forge(secret, true)), false);
  }
});

test("الأسرار المشتقة مرفوضة صراحةً حتى لو ضُبطت كقيمة TEACHER_SESSION_SECRET", async (t) => {
  envGuard(t);
  apply({
    TEACHER_SESSION_SECRET: `derived:${TEST_DB_URL}`,
    TEACHER_PASSWORD: TEST_PASSWORD,
    DATABASE_URL: TEST_DB_URL,
  });
  assert.equal(teacherSessionSecret(), null);
  assert.equal(teacherAuthConfigured(), false);
  assert.equal(await verifyTeacherSessionToken(forge(`derived:${TEST_DB_URL}`, true)), false);
});

test("السرّ القصير مرفوض كإعداد", (t) => {
  envGuard(t);
  apply({ TEACHER_SESSION_SECRET: "too-short", TEACHER_PASSWORD: TEST_PASSWORD });
  assert.equal(teacherSessionSecret(), null);
  assert.equal(teacherAuthConfigured(), false);
});

test("السرّ الثابت القديم مرفوض كإعداد", (t) => {
  envGuard(t);
  apply({ TEACHER_SESSION_SECRET: OLD_HARDCODED_SECRET, TEACHER_PASSWORD: TEST_PASSWORD });
  assert.equal(teacherSessionSecret(), null);
  assert.equal(teacherAuthConfigured(), false);
});

test("كلمة المرور وحدها لا تكفي لاعتبار الإعدادات مكتملة", (t) => {
  envGuard(t);
  apply({ TEACHER_SESSION_SECRET: undefined, TEACHER_PASSWORD: TEST_PASSWORD });
  assert.equal(teacherAuthConfigured(), false);
});

test("سرّ الجلسة وحده لا يكفي دون كلمة مرور", async (t) => {
  envGuard(t);
  apply({ TEACHER_SESSION_SECRET: TEST_SECRET, TEACHER_PASSWORD: undefined });
  assert.equal(teacherAuthConfigured(), false);
  assert.equal(await verifyTeacherSessionToken(forge(TEST_SECRET, true)), false);
  await assert.rejects(() => createTeacherSessionToken());
});

test("لا يُقبل سرّ جلسة مطابق لكلمة المرور أو رابط قاعدة البيانات", (t) => {
  envGuard(t);
  apply({ TEACHER_SESSION_SECRET: TEST_DB_URL, DATABASE_URL: TEST_DB_URL, TEACHER_PASSWORD: TEST_PASSWORD });
  assert.equal(teacherAuthConfigured(), false);
  apply({ TEACHER_SESSION_SECRET: TEST_SECRET, TEACHER_PASSWORD: TEST_SECRET });
  assert.equal(teacherAuthConfigured(), false);
});

test("الصيغة القديمة للرمز مرفوضة حتى بتوقيع صحيح بالسرّ الجديد", async (t) => {
  envGuard(t);
  configured();
  assert.equal(await verifyTeacherSessionToken(forge(TEST_SECRET, false)), false);
});

test("الحالة المسموحة: إصدار رمز v2 والتحقق منه ينجحان", async (t) => {
  envGuard(t);
  configured();
  const { token, maxAge } = await createTeacherSessionToken();
  assert.match(token, /^v2\.\d+\.[0-9a-f]{64}$/);
  assert.equal(maxAge, 12 * 60 * 60);
  assert.equal(await verifyTeacherSessionToken(token), true);
});

test("رمز صالح يُرفض فوراً إذا أُزيلت إعدادات الأمان", async (t) => {
  envGuard(t);
  configured();
  const { token } = await createTeacherSessionToken();
  assert.equal(await verifyTeacherSessionToken(token), true);

  clearSecurity();
  assert.equal(await verifyTeacherSessionToken(token), false);
});

test("العبث بالتوقيع أو الصلاحية أو الصيغة مرفوض", async (t) => {
  envGuard(t);
  configured();
  const { token } = await createTeacherSessionToken();

  const tampered = `${token.slice(0, -1)}${token.endsWith("0") ? "1" : "0"}`;
  assert.equal(await verifyTeacherSessionToken(tampered), false);
  assert.equal(await verifyTeacherSessionToken(token.replace("v2.", "v1.")), false);
  assert.equal(await verifyTeacherSessionToken(`v2.not-a-number.${"a".repeat(64)}`), false);
  assert.equal(await verifyTeacherSessionToken(undefined), false);
  assert.equal(await verifyTeacherSessionToken(""), false);

  const expired = await createTeacherSessionToken(Date.now() - 13 * 60 * 60 * 1000);
  assert.equal(await verifyTeacherSessionToken(expired.token), false);
});

test("تدوير سرّ التوقيع يُبطل الرموز القديمة ويقبل الرموز الجديدة", async (t) => {
  envGuard(t);
  configured(TEST_SECRET);
  const { token } = await createTeacherSessionToken();
  apply({ TEACHER_SESSION_SECRET: OTHER_SECRET });
  assert.equal(await verifyTeacherSessionToken(token), false);
  assert.equal(await verifyTeacherSessionToken(forge(TEST_SECRET, true)), false);
  const rotated = await createTeacherSessionToken();
  assert.equal(await verifyTeacherSessionToken(rotated.token), true);
});
