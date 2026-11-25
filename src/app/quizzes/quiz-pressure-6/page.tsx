import Link from "next/link";
import { LocalGradedQuizRunner } from "@/components/quiz/LocalGradedQuizRunner";
import { pressureQuiz } from "@/content/pressure-quiz";

export const metadata = { title: "اختبار الدرس الأول — الضغط" };

export default function PressureQuizPage() {
  return (
    <main className="container-x py-14">
      <Link href="/lessons/pressure" className="btn btn-ghost mb-6">
        العودة إلى درس الضغط
      </Link>
      <LocalGradedQuizRunner
        lessonQuestions={pressureQuiz}
        title="اختبار الدرس الأول — الضغط"
        kicker="الوحدة الثانية — الدرس الأول: الضغط"
      />
    </main>
  );
}
