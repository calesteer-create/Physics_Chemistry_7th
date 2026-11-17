import { NextResponse } from "next/server";
import { createTeacherSessionToken, TEACHER_COOKIE, teacherAuthConfigured } from "@/lib/auth";
import { verifyTeacherPassword } from "@/lib/passwords";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!teacherAuthConfigured()) {
      // P0-1: لا تُصدر جلسة إلا باكتمال المتغيّرين الإلزاميين؛ لا ندّعي حماية غير موجودة.
      return NextResponse.json(
        {
          ok: false,
          error:
            "إعدادات الأمان غير مكتملة. يلزم ضبط TEACHER_PASSWORD و TEACHER_SESSION_SECRET في متغيّرات بيئة الخادم.",
        },
        { status: 503 },
      );
    }

    const body = await request.json().catch(() => null);
    const password = typeof body?.password === "string" ? body.password : "";

    if (!verifyTeacherPassword(password)) {
      return NextResponse.json({ ok: false, error: "كلمة المرور غير صحيحة" }, { status: 401 });
    }

    const { token, maxAge } = await createTeacherSessionToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(TEACHER_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "خطأ في الخادم" }, { status: 500 });
  }
}
