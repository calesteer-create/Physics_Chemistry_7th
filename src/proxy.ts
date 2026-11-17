import { NextRequest, NextResponse } from "next/server";
import { TEACHER_COOKIE, teacherAuthConfigured, verifyTeacherSessionToken } from "@/lib/auth";

/**
 * حماية منطقة المعلم في جهة الخادم (Edge Proxy) — وليس مجرد إخفاء زرّ
 * في الواجهة. أي مسار داخل /teacher (عدا صفحة الدخول) يتطلب جلسة موقّعة صالحة.
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/teacher/login") return NextResponse.next();

  // P0-1: عند غياب إعدادات الأمان يُرفض الوصول حتى لو حمل الطالب كوكي مزوّر.
  if (!teacherAuthConfigured()) {
    return NextResponse.redirect(new URL("/teacher/login", request.url));
  }

  const token = request.cookies.get(TEACHER_COOKIE)?.value;
  const ok = await verifyTeacherSessionToken(token);
  if (ok) return NextResponse.next();

  const loginUrl = new URL("/teacher/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/teacher/:path*", "/teacher"],
};
