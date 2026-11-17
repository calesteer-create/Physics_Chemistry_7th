import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { students } from "@/db/schema";
import {
  LEGACY_STUDENT_COOKIE,
  STUDENT_SESSION_COOKIE,
  createStudentSessionToken,
  studentSessionConfigured,
  studentSessionCookieOptions,
} from "@/lib/student-session";

export const dynamic = "force-dynamic";

/**
 * إنشاء ملف طالب جديد — ثم إصدار جلسة موقّعة.
 *
 * P1-4b:
 * 1) لا تُنشأ أيّ ملف ولا أيّ جلسة قبل اكتمال إعدادات الجلسات (fail closed).
 * 2) الجلسة (الكوكي) تُنشأ **بعد** نجاح الإدراج فقط.
 * 3) الكوكي `student_id` القديمة غير موقّعة: تُمسح من المتصفح ولا تمنح وصولاً.
 */
export async function POST(request: Request) {
  try {
    if (!studentSessionConfigured()) {
      // لا تُصدر جلسة ولا تنشئ صفّاً يتيماً: تُرفض العملية كلها.
      return NextResponse.json(
        {
          ok: false,
          error:
            "إعدادات جلسات الطالب غير مكتملة. يلزم ضبط STUDENT_SESSION_SECRET في متغيّرات بيئة الخادم.",
        },
        { status: 503 },
      );
    }

    const body = await request.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (name.length < 2 || name.length > 60) {
      return NextResponse.json({ ok: false, error: "الاسم يجب أن يكون بين حرفين و60 حرفًا" }, { status: 400 });
    }

    const [row] = await getDb().insert(students).values({ name }).returning();

    // الجلسة لا تُنشأ إلا بعد نجاح عملية الإنشاء.
    const { token, maxAge } = await createStudentSessionToken(row.id);

    const res = NextResponse.json({ ok: true, student: { id: row.id, name: row.name } });
    res.cookies.set(STUDENT_SESSION_COOKIE, token, studentSessionCookieOptions(maxAge));
    // الكوكي القديمة (معرّف غير موقّع) تُمسح: لا يمكن أن تمنح أي وصول.
    res.cookies.set(LEGACY_STUDENT_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "تعذر إنشاء الملف، حاول مجددًا" }, { status: 500 });
  }
}
