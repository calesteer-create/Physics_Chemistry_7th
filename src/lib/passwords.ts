import "server-only";
import { scryptSync, timingSafeEqual } from "crypto";
import { readServerEnv } from "./env";

/**
 * التحقق من كلمة مرور المعلم في جهة الخادم فقط.
 *
 * تُضبط كلمة المرور عبر متغيّر البيئة TEACHER_PASSWORD (أسرار آمنة قابلة
 * للتغيير)، ولا تظهر أبدًا في الشيفرة أو ملفات الواجهة. لا يحدث التخزين
 * كنص صريح قابل للقراءة من العميل؛ تُقارن البصمات المشتقة عبر scrypt
 * بمقارنة زمنية ثابتة.
 */

const SALT = "pc7-teacher-gate-v1";

function derive(value: string): Buffer {
  return scryptSync(value, SALT, 32);
}

export function teacherPasswordConfigured(): boolean {
  const password = readServerEnv("TEACHER_PASSWORD");
  return Boolean(password && password.length >= 6);
}

export function verifyTeacherPassword(candidate: string): boolean {
  if (!teacherPasswordConfigured()) return false;
  const expected = derive(readServerEnv("TEACHER_PASSWORD") as string);
  const given = derive(candidate);
  return timingSafeEqual(expected, given);
}
