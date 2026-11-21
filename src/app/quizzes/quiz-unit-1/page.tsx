import Link from 'next/link';
import {LocalGradedQuizRunner} from '@/components/quiz/LocalGradedQuizRunner';
export const metadata={title:'اختبار الوحدة الأولى الشامل — الحركة والتحريك'};
export default function UnitAssessmentPage(){return <main className="container-x py-14"><Link href="/units/unit-1" className="btn btn-ghost mb-6">العودة إلى الوحدة الأولى</Link><LocalGradedQuizRunner/></main>;}
