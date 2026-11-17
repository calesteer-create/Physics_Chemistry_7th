import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { students } from "@/db/schema";
import {
  STUDENT_SESSION_COOKIE,
  resolveStudentSession,
  type StudentRecord,
} from "./student-session";

/**
 * جلب سجلّ الطالب بمعرّفه.
 * أي فشل (قاعدة غير متاحة، معرّف غير موجود) ⇒ null، أي لا ملكية.
 */
export async function findStudentById(studentId: string): Promise<StudentRecord | null> {
  try {
    const rows = await getDb()
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * يعيد ملف الطالب الحالي من **الجلسة الموقّعة** فقط، أو null إن لم تكن
 * جلسة صالحة (موقّعة، ضمن الصلاحية، وبسجلّ موجود في قاعدة البيانات).
 *
 * P1-4b: لم يعد الكوكي القديم `student_id` (غير موقّع) مصدر هوية إطلاقاً —
 * لأن أي زائر كان يستطيع كتابته في متصفّحه والاطّلاع على بيانات طالب آخر.
 */
export async function getCurrentStudent(): Promise<StudentRecord | null> {
  const store = await cookies();
  const token = store.get(STUDENT_SESSION_COOKIE)?.value;
  const resolution = await resolveStudentSession(token, findStudentById);
  return resolution.ok ? resolution.student : null;
}
