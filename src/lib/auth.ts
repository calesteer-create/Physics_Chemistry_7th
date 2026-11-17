/**
 * جلسات المعلم — توقيع HMAC-SHA256 باستخدام Web Crypto
 * (تعمل في Proxy/Edge وفي مسارات الخادم على حد سواء).
 *
 * ═══ قواعد المرحلة الأولى (P0-1) ═══
 * 1) لا يوجد أي سرّ افتراضي، ولا سرّ مشتق من TEACHER_PASSWORD أو DATABASE_URL،
 *    ولا قيمة مُثبّتة في الشيفرة. أي رمز مُوقّع بتلك القيم يُرفض تلقائياً.
 * 2) TEACHER_SESSION_SECRET إلزامي (32 حرفاً على الأقل) في كل بيئة،
 *    وكذلك TEACHER_PASSWORD. عند غياب أيّ منهما: لا تُصدر جلسة، ولا تُقبل
 *    جلسة، ويُرفض الوصول إلى منطقة المعلم (fail closed).
 * 3) صيغة الرمز مُنسَّخة إلى `v2` وتُوقّع مع بادئة النسخة، كي تُرفض كل
 *    الرموز القديمة `<expiry>.<sig>` حتى لو صادف أن طابق سرّها الجديد.
 * 4) يُقرأ السرّ في زمن التشغيل عبر `readServerEnv` (لا يُخبز في البناء).
 *
 * هذه تغييرات أمنية تقتضيها الثغرة المُثبتة في تقرير التدقيق؛ لا يُغيّر
 * أي منها التصميم أو تجربة المستخدم، باستثناء رسالة ضبط بيانات الدخول
 * التي أصبحت تذكر المتغيّرين الإلزاميين بدل متغيّر واحد.
 */

import { readServerEnv } from "./env";

export const TEACHER_COOKIE = "teacher_session";
export const TEACHER_SESSION_SECRET_MIN_LENGTH = 32;
export const TEACHER_PASSWORD_MIN_LENGTH = 6;

const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 ساعة
const TOKEN_VERSION = "v2";
const CLOCK_SKEW_MS = 60_000;
const OLD_INSECURE_SECRET = "insecure-dev-secret-change-me";

const encoder = new TextEncoder();

/** السرّ الصالح الوحيد: مُضبوط صراحةً، بطول كافٍ، وليس قيمة قديمة/مشتقة. */
export function teacherSessionSecret(): string | null {
  const raw = readServerEnv("TEACHER_SESSION_SECRET");
  if (!raw) return null;
  const secret = raw.trim();
  if (secret.length < TEACHER_SESSION_SECRET_MIN_LENGTH) return null;
  if (secret === OLD_INSECURE_SECRET) return null;
  if (secret.startsWith("derived:")) return null;
  if (secret === readServerEnv("TEACHER_PASSWORD") || secret === readServerEnv("DATABASE_URL")) return null;
  return secret;
}

/** هل اكتملت إعدادات الأمان؟ يُستخدم لرفض الوصول عند غيابها. */
export function teacherAuthConfigured(): boolean {
  const password = readServerEnv("TEACHER_PASSWORD");
  return (
    teacherSessionSecret() !== null &&
    typeof password === "string" &&
    password.length >= TEACHER_PASSWORD_MIN_LENGTH
  );
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

/** يُصدر جلسة فقط عند اكتمال إعدادات الأمان؛ يرمي خلاف ذلك. */
export async function createTeacherSessionToken(
  nowMs: number = Date.now(),
): Promise<{ token: string; maxAge: number }> {
  const secret = teacherSessionSecret();
  if (!secret || !teacherAuthConfigured()) {
    throw new Error("Teacher authentication is not configured");
  }
  const expiry = String(nowMs + SESSION_TTL_MS);
  const payload = `${TOKEN_VERSION}.${expiry}`;
  const sig = await hmacHex(payload, secret);
  return { token: `${payload}.${sig}`, maxAge: SESSION_TTL_MS / 1000 };
}

/** لا تُقبل أي جلسة عند غياب إعدادات الأمان، ولا أي رمز قديم أو مُزوَّر. */
export async function verifyTeacherSessionToken(
  token: string | undefined | null,
  nowMs: number = Date.now(),
): Promise<boolean> {
  const secret = teacherSessionSecret();
  if (!secret || !teacherAuthConfigured()) return false;
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== TOKEN_VERSION) return false;
  const [, expiryRaw, sig] = parts;
  if (!/^\d+$/.test(expiryRaw) || !/^[0-9a-f]{64}$/.test(sig)) return false;

  const expiry = Number(expiryRaw);
  if (
    !Number.isSafeInteger(expiry) ||
    expiry <= nowMs ||
    expiry > nowMs + SESSION_TTL_MS + CLOCK_SKEW_MS
  ) {
    return false;
  }

  try {
    const expected = await hmacHex(`${TOKEN_VERSION}.${expiryRaw}`, secret);
    return constantTimeEqual(expected, sig);
  } catch {
    return false;
  }
}
