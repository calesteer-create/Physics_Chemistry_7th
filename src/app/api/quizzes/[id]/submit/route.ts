import { NextResponse } from "next/server";
import { db } from "@/db";
import { quizAttempts } from "@/db/schema";
import { STUDENT_COOKIE } from "@/lib/student";
import { deniedSubmissionBody, gateQuizSubmission } from "@/lib/quiz-submission";
import { getQuizFull } from "@/content/quiz-bank";

export const dynamic = "force-dynamic";

interface QuestionFeedback {
  id: string;
  correct: boolean;
}

function normalizeFill(s: string): string {
  return s.trim().replace(/\s+/g, " ").replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** تصحيح محاولة مكتملة، دون إرسال مفاتيح الإجابة أو الشروح للعميل. */
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
    const answers = gate.answers;

    let score = 0;
    const feedback: QuestionFeedback[] = [];

    for (const ans of quiz.answers) {
      const q = quiz.questions.find((x) => x.id === ans.id);
      if (!q) continue;
      const given = answers[ans.id];

      if (ans.type === "mcq" && q.type === "mcq") {
        const idx = typeof given === "number" ? given : -1;
        const ok = idx === ans.correct;
        if (ok) score++;
        feedback.push({
          id: ans.id,
          correct: ok,
        });
      } else if (ans.type === "tf") {
        const val = typeof given === "boolean" ? given : null;
        const ok = val === ans.correct;
        if (ok) score++;
        feedback.push({
          id: ans.id,
          correct: ok,
        });
      } else if (ans.type === "fill") {
        const val = typeof given === "string" ? normalizeFill(given) : "";
        const ok = ans.accepted.some((a) => normalizeFill(a) === val && val !== "");
        if (ok) score++;
        feedback.push({
          id: ans.id,
          correct: ok,
        });
      }
    }

    const total = quiz.answers.length;

    // تسجيل المحاولة إن وُجد ملف طالب
    const studentId = request.headers.get("cookie")
      ?.split(";").map((c) => c.trim())
      .find((c) => c.startsWith(`${STUDENT_COOKIE}=`))
      ?.split("=")[1];

    if (studentId) {
      try {
        await db.insert(quizAttempts).values({
          studentId,
          quizId: quiz.id,
          lessonSlug: quiz.lessonSlug,
          score,
          total,
          answers: answers as Record<string, string | string[] | number | null>,
        });
      } catch {
        // لا نفشل التصحيح إن تعذّر الحفظ
      }
    }

    return NextResponse.json({ ok: true, score, total, feedback, saved: Boolean(studentId) });
  } catch {
    return NextResponse.json({ ok: false, error: "تعذّر التصحيح، حاول مجددًا" }, { status: 500 });
  }
}
