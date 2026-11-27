import { simpleMachinesLesson } from "./lessons/unit1/simple-machines";
import type { Lesson, Unit } from "./types";
import { orientationLesson } from "./lessons/orientation";
import { motionAndRestLesson } from "./lessons/unit1/motion-and-rest";
import { forceAndMotionLesson } from "./lessons/unit1/force-and-motion";
import { forceOnOneSupportLesson } from "./lessons/unit1/force-on-one-support";
import { workAndPowerLesson } from "./lessons/unit1/work-and-power";
import { pressureLesson } from "./lessons/unit2/pressure";
import { pressureInLiquidsLesson } from "./lessons/unit2/pressure-in-liquids";

/**
 * السجل المركزي للمحتوى.
 * تُضاف الدروس المنهجية هنا بعد ورود صور الكتاب المدرسي واعتمادها.
 */

const LESSONS: Lesson[] = [orientationLesson, motionAndRestLesson, forceAndMotionLesson, forceOnOneSupportLesson, workAndPowerLesson, simpleMachinesLesson, pressureLesson, pressureInLiquidsLesson];

export const units: Unit[] = [
  {
    slug: "unit-1",
    title: "الحركة والتحريك",
    description: "مفاهيم الحركة والسكون، القوة والحركة، القوى على حامل واحد، العمل والاستطاعة، والآلات البسيطة.",
    order: 1,
    status: "active",
    lessons: [
      { slug: "motion-and-rest", title: "الحركة والسكون", status: "published" },
      { slug: "force-and-motion", title: "القوة والحركة", status: "published" },
      { slug: "forces-on-one-support", title: "القوى على حامل واحد", status: "published" },
      { slug: "work-and-power", title: "العمل والاستطاعة", status: "published" },
      { slug: "simple-machines", title: "الآلات البسيطة", status: "published" },
    ],
  },
  {
    slug: "unit-2",
    title: "الضغط ودافعة أرخميدس",
    description: "الضغط، الضغط في السوائل، دافعة أرخميدس، ومشروع وسائل النقل.",
    order: 2,
    status: "active",
    lessons: [
      { slug: "pressure", title: "الضغط", status: "published" },
      { slug: "pressure-in-liquids", title: "الضغط في السوائل", status: "published" },
      { slug: "archimedes-buoyancy", title: "دافعة أرخميدس", status: "pending" },
      { slug: "transport-project", title: "مشروع وسائل النقل", status: "pending" },
    ],
  },
  {
    slug: "unit-3",
    title: "المادّة والحرارة",
    description: "الحرارة، انتشار الحرارة، وتمدّد الأجسام بالحرارة.",
    order: 3,
    status: "pending",
    lessons: [
      { slug: "heat", title: "الحرارة", status: "pending" },
      { slug: "heat-transfer", title: "انتشار الحرارة", status: "pending" },
      { slug: "thermal-expansion", title: "تمدّد الأجسام بالحرارة", status: "pending" },
    ],
  },
  {
    slug: "unit-4",
    title: "المادة والطاقة",
    description: "الذرّة، العناصر والمركبات، الأمواج الصوتية، ومشروع الحافظة الحرارية للسائل.",
    order: 4,
    status: "pending",
    lessons: [
      { slug: "atom", title: "الذرّة", status: "pending" },
      { slug: "elements-and-compounds", title: "العناصر والمركبات", status: "pending" },
      { slug: "sound-waves", title: "الأمواج الصوتية", status: "pending" },
      { slug: "thermal-container-project", title: "مشروع الحافظة الحرارية للسائل", status: "pending" },
    ],
  },
];

export function listLessons(): Lesson[] {
  return LESSONS;
}

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug && l.status === "published");
}

export function getLessonMeta(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function listPublishedLessons(): Lesson[] {
  return LESSONS.filter((l) => l.status === "published");
}
