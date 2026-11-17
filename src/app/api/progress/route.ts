import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "@/db";
import { lessonProgress } from "@/db/schema";
import { STUDENT_SESSION_COOKIE, resolveStudentSession } from "@/lib/student-session";
import { findStudentById } from "@/lib/student";
import { getLessonMeta } from "@/content/registry";

export const dynamic = "force-dynamic";

/**
 * حفظ تقدّم الطالب داخل درس — يتطلّب جلسة طالب موقّعة صالحة.
 *
 * P1-4b: معرّف الطالب يُشتق من الجلسة الموقّعة **وحدها**.
 * لا يُقرأ من كوكي يرسله المتصفح، ولا من جسم الطلب، ولا من نصّ الطلب.
 */
export async function POST(request: Request) {
  try {
    const store = await cookies();
    const token = store.get(STUDENT_SESSION_COOKIE)?.value;
    const resolution = await resolveStudentSession(token, findStudentById);
    if (!resolution.ok) {
      // ليس خطأً — الحفظ يعمل فقط بعد تسجيل الاسم في منطقة الطالب
      return NextResponse.json({ ok: true, saved: false });
    }
    const studentId = resolution.studentId;

    const body = await request.json().catch(() => null);
    const lessonSlug = typeof body?.lessonSlug === "string" ? body.lessonSlug : "";
    const stageIndex = Number.isInteger(body?.stageIndex) ? Math.max(0, Math.min(8, body.stageIndex)) : 0;
    const notebookViewed = Boolean(body?.notebookViewed);

    if (!getLessonMeta(lessonSlug)) {
      return NextResponse.json({ ok: false, error: "درس غير معروف" }, { status: 404 });
    }

    const database = getDb();
    const existing = await database
      .select()
      .from(lessonProgress)
      .where(and(eq(lessonProgress.studentId, studentId), eq(lessonProgress.lessonSlug, lessonSlug)))
      .limit(1);

    if (existing.length > 0) {
      const prev = existing[0];
      const completed = Array.from(new Set([...(prev.completedStages as number[]), ...Array.from({ length: stageIndex + 1 }, (_, i) => i)]));
      await database
        .update(lessonProgress)
        .set({
          stageIndex: Math.max(prev.stageIndex, stageIndex),
          completedStages: completed,
          notebookViewed: prev.notebookViewed || notebookViewed,
          updatedAt: new Date(),
        })
        .where(eq(lessonProgress.id, prev.id));
    } else {
      await database.insert(lessonProgress).values({
        studentId,
        lessonSlug,
        stageIndex,
        completedStages: Array.from({ length: stageIndex + 1 }, (_, i) => i),
        notebookViewed,
      });
    }

    return NextResponse.json({ ok: true, saved: true });
  } catch {
    return NextResponse.json({ ok: false, error: "تعذر حفظ التقدم" }, { status: 500 });
  }
}
