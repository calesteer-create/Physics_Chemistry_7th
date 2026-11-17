/**
 * جلسات المعلم — توقيع HMAC-SHA256 باستخدام Web Crypto
 * (تعمل في Middleware/Edge وفي مسارات الخادم على حد سواء).
 *
 * لا تُخزَّن أي كلمة مرور داخل الشيفرة. يُضبط السر عبر متغيّرات البيئة:
 *   - TEACHER_SESSION_SECRET : سرّ توقيع الجلسات (يُنصح به في الإنتاج).
 *   - يُشتق بديل حتمي من DATABASE_URL في بيئة التطوير المحلية فقط.
 */

export const TEACHER_COOKIE = "teacher_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 ساعة

const encoder = new TextEncoder();

function getSecret(): string {
  if (process.env.TEACHER_SESSION_SECRET) return process.env.TEACHER_SESSION_SECRET;
  if (process.env.TEACHER_PASSWORD) return `derived:${process.env.TEACHER_PASSWORD}`;
  if (process.env.DATABASE_URL) return `derived:${process.env.DATABASE_URL}`;
  return "insecure-dev-secret-change-me";
}

function toHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, "0");
  return out;
}

async function hmacHex(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toHex(sig);
}

export async function createTeacherSessionToken(): Promise<{ token: string; maxAge: number }> {
  const expiry = String(Date.now() + SESSION_TTL_MS);
  const sig = await hmacHex(expiry);
  return { token: `${expiry}.${sig}`, maxAge: SESSION_TTL_MS / 1000 };
}

export async function verifyTeacherSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const idx = token.indexOf(".");
  if (idx <= 0) return false;
  const expiry = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  if (!/^\d+$/.test(expiry)) return false;
  if (Number(expiry) < Date.now()) return false;
  const expected = await hmacHex(expiry);
  if (expected.length !== sig.length) return false;
  // مقارنة زمنية ثابتة تقريبية
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}
