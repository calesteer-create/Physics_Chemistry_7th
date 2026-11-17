/**
 * جلسات الطالب الموقّعة — توقيع HMAC-SHA256 باستخدام Web Crypto
 * (تعمل في Proxy/Edge وفي مسارات الخادم على حد سواء).
 *
 * ═══ قواعد المرحلة P1-4b ═══
 * 1) لا يوجد أي سرّ افتراضي، ولا سرّ مشتق من TEACHER_PASSWORD أو DATABASE_URL
 *    أو TEACHER_SESSION_SECRET، ولا قيمة مُثبّتة في الشيفرة.
 * 2) STUDENT_SESSION_SECRET إلزامي (32 محرفاً على الأقل) في كل بيئة.
 *    عند غياب أيّ من هذه الشروط: لا تُصدر جلسة، ولا تُقبل جلسة، ولا تُنشأ
 *    ملفات طلاب (fail closed).
 * 3) صيغة الرمز مُنسَّخة إلى `v1` وتُوقَّع مع بادئة النسخة، كي تُرفض كل
 *    الرموز ذات الصيغة الأخرى.
 * 4) ownership: معرّف الطالب يأتي من الرمز الموقَّع فقط — لا من كوكي يرسله
 *    المتصفح، ولا من جسم الطلب، ولا من نصّ الطلب.
 * 5) لا يُقبل معرّف إلا إذا كان UUID صحيحاً وله سجلّ فعلي في قاعدة البيانات.
 * 6) يُقرأ السرّ في زمن التشغيل عبر `readServerEnv` (لا يُخبز في البناء).
 *
 * هذه الوحدة **خالصة**: لا تستورد `next/headers` ولا قاعدة البيانات، كي تبقى
 * قابلة للاختبار وحدوياً. ربطها بالـ cookies وقاعدة البيانات في
 * `src/lib/student.ts`.
 */

import { readServerEnv } from "./env";

export const STUDENT_SESSION_COOKIE = "student_session";

/** الكوكي القديم (غير موقّع) — يُمسح من المتصفح ولا يمنح أي وصول. */
export const LEGACY_STUDENT_COOKIE = "student_id";

export const STUDENT_SESSION_SECRET_MIN_LENGTH = 32;

/** صلاحية الجلسة: 30 يوماً — الطالب لا يُطرد كل ساعات. */
export const STUDENT_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

const TOKEN_VERSION = "v1";
const CLOCK_SKEW_MS = 60_000;

const encoder = new TextEncoder();

/** UUID صحيح الصيغة (RFC 4122): إصدار 1–8 ونوع 8/9/a/b — يُرفض الـ nil. */
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** الحد الأدنى لبيانات الطالب اللازمة لإثبات الملكية. */
export interface StudentRecord {
  id: string;
  name: string;
  createdAt: Date;
}

export type StudentLookup = (studentId: string) => Promise<StudentRecord | null>;

export type StudentSessionFailureReason =
  | "not-configured"
  | "malformed"
  | "invalid-version"
  | "invalid-uuid"
  | "expired"
  | "expiry-out-of-range"
  | "bad-signature"
  | "student-not-found"
  | "lookup-failed";

export type StudentSessionResult =
  | { ok: true; studentId: string }
  | { ok: false; reason: StudentSessionFailureReason };

export type StudentSessionResolution =
  | { ok: true; studentId: string; student: StudentRecord }
  | { ok: false; reason: StudentSessionFailureReason };

/** هل المعرّف UUID صحيح؟ */
export function isValidStudentUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

/**
 * السرّ الصالح الوحيد: مُضبوط صراحةً، بطول كافٍ، مستقلّ عن أسرار المعلم
 * وعن رابط قاعدة البيانات، وليس قيمة مشتقّة.
 */
export function studentSessionSecret(): string | null {
  const raw = readServerEnv("STUDENT_SESSION_SECRET");
  if (!raw) return null;
  const secret = raw.trim();
  if (secret.length < STUDENT_SESSION_SECRET_MIN_LENGTH) return null;
  if (secret.startsWith("derived:")) return null;
  if (secret === readServerEnv("TEACHER_SESSION_SECRET")) return null;
  if (secret === readServerEnv("TEACHER_PASSWORD")) return null;
  if (secret === readServerEnv("DATABASE_URL")) return null;
  return secret;
}

/** هل اكتملت إعدادات جلسات الطالب؟ يُستخدم لرفض كل شيء عند غيابها. */
export function studentSessionConfigured(): boolean {
  return studentSessionSecret() !== null;
}

function toHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, "0");
  return out;
}

async function hmacHex(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toHex(sig);
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * يُصدر رمز جلسة لطالب **بعد** نجاح عملية الإنشاء فقط.
 * يرمي استثناءً إن لم تكتمل الإعدادات أو كان المعرّف UUID غير صحيح.
 */
export async function createStudentSessionToken(
  studentId: string,
  nowMs: number = Date.now(),
): Promise<{ token: string; maxAge: number }> {
  const secret = studentSessionSecret();
  if (!secret) {
    throw new Error("Student session authentication is not configured");
  }
  if (!isValidStudentUuid(studentId)) {
    throw new Error("Invalid student id");
  }
  const expiry = String(nowMs + STUDENT_SESSION_TTL_MS);
  const payload = `${TOKEN_VERSION}.${studentId}.${expiry}`;
  const sig = await hmacHex(payload, secret);
  return { token: `${payload}.${sig}`, maxAge: STUDENT_SESSION_TTL_MS / 1000 };
}

/**
 * يتحقق من التوقيع والصلاحية وصحة الـ UUID.
 * أي فشل ⇒ رفض (fail closed) بلا استثناء.
 */
export async function verifyStudentSessionToken(
  token: string | undefined | null,
  nowMs: number = Date.now(),
): Promise<StudentSessionResult> {
  const secret = studentSessionSecret();
  if (!secret) return { ok: false, reason: "not-configured" };
  if (!token || typeof token !== "string") return { ok: false, reason: "malformed" };

  const parts = token.split(".");
  if (parts.length !== 4) return { ok: false, reason: "malformed" };
  const [version, studentId, expiryRaw, sig] = parts;
  if (version !== TOKEN_VERSION) return { ok: false, reason: "invalid-version" };
  if (!isValidStudentUuid(studentId)) return { ok: false, reason: "invalid-uuid" };
  if (!/^\d+$/.test(expiryRaw) || !/^[0-9a-f]{64}$/.test(sig)) {
    return { ok: false, reason: "malformed" };
  }

  const expiry = Number(expiryRaw);
  if (!Number.isSafeInteger(expiry)) return { ok: false, reason: "malformed" };
  if (expiry <= nowMs) return { ok: false, reason: "expired" };
  if (expiry > nowMs + STUDENT_SESSION_TTL_MS + CLOCK_SKEW_MS) {
    return { ok: false, reason: "expiry-out-of-range" };
  }

  try {
    const expected = await hmacHex(`${TOKEN_VERSION}.${studentId}.${expiryRaw}`, secret);
    if (!constantTimeEqual(expected, sig)) return { ok: false, reason: "bad-signature" };
  } catch {
    return { ok: false, reason: "bad-signature" };
  }

  return { ok: true, studentId };
}

/**
 * يستنتج ملكية الطالب من الجلسة الموقّعة وحدها:
 * توقيع صالح + صلاحية سارية + UUID صحيح + **سجلّ موجود في قاعدة البيانات**.
 * أي نقص ⇒ لا ملكية.
 */
export async function resolveStudentSession(
  token: string | undefined | null,
  lookup: StudentLookup,
  nowMs: number = Date.now(),
): Promise<StudentSessionResolution> {
  const verified = await verifyStudentSessionToken(token, nowMs);
  if (!verified.ok) return verified;

  let student: StudentRecord | null = null;
  try {
    student = await lookup(verified.studentId);
  } catch {
    return { ok: false, reason: "lookup-failed" };
  }
  if (!student) return { ok: false, reason: "student-not-found" };

  return { ok: true, studentId: verified.studentId, student };
}

/**
 * إعدادات كوكي الجلسة: HttpAlways، Secure في الإنتاج، SameSite=Lax، Path=/.
 * مركزية كي تُختبَر وتُستعمل في مكان واحد.
 */
export function studentSessionCookieOptions(maxAge: number): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: readServerEnv("NODE_ENV") === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}
