import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { students } from "@/db/schema";

export const STUDENT_COOKIE = "student_id";

/** يعيد ملف الطالب الحالي من الكوكي، أو null إن لم يسجّل اسمه بعد. */
export async function getCurrentStudent() {
  const store = await cookies();
  const id = store.get(STUDENT_COOKIE)?.value;
  if (!id) return null;
  try {
    const rows = await getDb().select().from(students).where(eq(students.id, id)).limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}
