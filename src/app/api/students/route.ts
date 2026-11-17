import { NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { STUDENT_COOKIE } from "@/lib/student";

export const dynamic = "force-dynamic";

/** إنشاء ملف طالب جديد وتثبيت كوكي الجلسة */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (name.length < 2 || name.length > 60) {
      return NextResponse.json({ ok: false, error: "الاسم يجب أن يكون بين حرفين و60 حرفًا" }, { status: 400 });
    }
    const [row] = await db.insert(students).values({ name }).returning();
    const res = NextResponse.json({ ok: true, student: { id: row.id, name: row.name } });
    res.cookies.set(STUDENT_COOKIE, row.id, {
      httpOnly: false, // تحتاجه الواجهة لمعرفة حالة التسجيل
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "تعذر إنشاء الملف، حاول مجددًا" }, { status: 500 });
  }
}
