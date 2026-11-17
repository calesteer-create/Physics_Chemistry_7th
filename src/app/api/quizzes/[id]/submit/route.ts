import { NextResponse } from "next/server";
import { deniedSubmissionBody, gateQuizSubmission } from "@/lib/quiz-submission";
import { getQuizFull } from "@/content/quiz-bank";

export const dynamic = "force-dynamic";

/** قبول محاولة مكتملة دون تصحيحها أو تخزين درجة قابلة للاستعلام. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const quiz = getQuizFull(id);
    if (!quiz) return NextResponse.json({ ok: false, error: "اختبار غير موجود" }, { status: 404 });

    const body = await request.json().catch(() => null);

    // لا يُصحّح طلب ناقص أو غير صالح.
    const gate = gateQuizSubmission(
      quiz.questions.map((q) => ({
        id: q.id,
        type: q.type,
        optionCount: q.type === "mcq" ? q.options.length : undefined,
      })),
      body?.answers,
    );
    if (!gate.ok) {
      return NextResponse.json(deniedSubmissionBody(gate), { status: gate.status });
    }
    // هوية الطالب الحالية غير موثوقة، وصفحة الطالب تعرض الدرجات المحفوظة.
    // لذلك لا نُصحّح ولا نحفظ درجة: إخفاؤها من هذه الاستجابة وحده لا يكفي.
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "تعذّر التصحيح، حاول مجددًا" }, { status: 500 });
  }
}
