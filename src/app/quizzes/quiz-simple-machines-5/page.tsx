import Link from 'next/link';
import {LocalGradedQuizRunner} from '@/components/quiz/LocalGradedQuizRunner';
import {simpleMachinesQuiz} from '@/content/simple-machines-quiz';
export const metadata={title:'اختبار الدرس الخامس — الآلات البسيطة'};
export default function SimpleMachinesQuizPage(){return <main className="container-x py-14"><Link href="/lessons/simple-machines" className="btn btn-ghost mb-6">العودة إلى الدرس الخامس</Link><LocalGradedQuizRunner lessonQuestions={simpleMachinesQuiz}/></main>;}
