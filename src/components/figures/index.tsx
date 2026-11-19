import type { ReactElement } from "react";
import type { FigureRef, Rich } from "@/content/types";
import { RichText } from "@/components/content/RichText";
import { BookOpen, PenTool } from "lucide-react";
import {
  UniformMotionChart,
  UniformMotionChart2,
  NonUniformMotionChart,
  StationaryChart,
  PathTypesDiagram,
  SpeedometerSVG,
  SkateboarderSVG,
  CarReferenceSVG,
} from "./motion-charts";
import { ExplainedNonUniformMotionChart, ExplainedSpeedometerSVG } from "./motion-explanation-figures";
import {
  ForceVectorDiagram,
  HangingBallForcesDiagram,
  ForceScaleDrawing,
  SpringMagnetExperiment,
} from "./force-figures";
import {
  ForceVectorDiagramExplained,
  SpringWeightExplained,
  MassWeightExplained,
} from "./force-explanation-figures";
import {
  BookOnTableFigure,
  TugOfWarFigure,
  CarPullersFigure,
  ResultantSameDirectionFigure,
  OppositeForcesRingFigure,
  ResultantOppositeForcesFigure,
  DirectOppositeEqualForcesFigure,
  ActionReactionFigure,
  ActionReactionExamplesGrid,
  ParachuteFigure,
} from "./one-support-figures";
import type { ReactNode } from "react";

/**
 * مكتبة الرسومات الرقمية المعاد إنتاجها.
 * كل رسم موثّق: مصدره من الكتاب (الصفحة) وطريقة إنتاجه.
 * عند إضافة دروس منهجية تُسجَّل رسوماتها هنا وتُقارن بالأصل قبل الاعتماد.
 */

/* ---------- رسم: مخطط الصفحة المنظمة في الدفتر (نسخة مخصصة للرسم اليدوي) ---------- */
function NotebookPageLayoutSVG() {
  return (
    <svg viewBox="0 0 340 460" className="h-auto w-full max-w-[340px]" role="img"
      aria-label="مخطط صفحة دفتر منظمة">
      <defs>
        <linearGradient id="nbp" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fdfaf1" />
          <stop offset="1" stopColor="#f3ecd9" />
        </linearGradient>
      </defs>
      {/* ورقة الدفتر */}
      <rect x="14" y="10" width="312" height="440" rx="10" fill="url(#nbp)" stroke="#c9b98c" strokeWidth="2" />
      {/* خط الهامش */}
      <line x1="288" y1="10" x2="288" y2="450" stroke="#e08a8a" strokeWidth="1.6" opacity="0.7" />
      {/* سطور */}
      {[70, 100, 130, 195, 225, 290, 320, 350, 410].map((y) => (
        <line key={y} x1="30" y1={y} x2="312" y2={y} stroke="#b9c8e2" strokeWidth="1" opacity="0.55" />
      ))}
      {/* 1 عنوان الدرس */}
      <g fontFamily="'Cairo Variable', sans-serif" fontWeight="800" fontSize="12">
        <rect x="156" y="26" width="130" height="26" rx="6" fill="#1d4ed8" opacity="0.12" />
        <text x="221" y="44" textAnchor="middle" fill="#1d4ed8">١) عنوان الدرس + التاريخ</text>
        {/* 2 عناوين فرعية */}
        <text x="276" y="88" textAnchor="end" fill="#33415e">٢) العنوان الفرعي الأول...</text>
        {/* 3 التعريف داخل إطار */}
        <rect x="40" y="146" width="236" height="64" rx="8" fill="none" stroke="#1d4ed8" strokeWidth="2.2" />
        <text x="158" y="170" textAnchor="middle" fill="#1d4ed8">٣) التعريف داخل إطار</text>
        <text x="158" y="194" textAnchor="middle" fill="#4a5b7d" fontSize="10">يكتب كاملًا دون اختصار يخلّ بالمعنى</text>
        {/* 4 القانون داخل صندوق */}
        <rect x="70" y="238" width="176" height="66" rx="8" fill="#0f766e" opacity="0.1" />
        <rect x="70" y="238" width="176" height="66" rx="8" fill="none" stroke="#0f766e" strokeWidth="2.2" />
        <text x="158" y="264" textAnchor="middle" fill="#0f766e">٤) القانون داخل صندوق</text>
        <text x="158" y="288" textAnchor="middle" fill="#3f6b66" fontSize="10">ثم تحته معنى كل رمز ووحدته</text>
        {/* 5 الرسم */}
        <rect x="96" y="318" width="124" height="62" rx="8" fill="none" stroke="#7c3aed" strokeWidth="2" strokeDasharray="6 4" />
        <text x="158" y="344" textAnchor="middle" fill="#7c3aed">٥) الرسم المطلوب</text>
        <text x="158" y="366" textAnchor="middle" fill="#6d5b97" fontSize="10">بقلم الرصاص + كل التسميات</text>
        {/* 6 الملاحظة */}
        <rect x="52" y="394" width="224" height="40" rx="8" fill="#b45309" opacity="0.1" />
        <text x="164" y="419" textAnchor="middle" fill="#b45309">٦) ملاحظة مهمة / استنتاج</text>
      </g>
    </svg>
  );
}

const FIGURES: Record<string, () => ReactElement> = {
  "notebook-page-layout": NotebookPageLayoutSVG,
  "uniform-motion-chart": UniformMotionChart,
  "uniform-motion-chart-2": UniformMotionChart2,
  "non-uniform-motion-chart": NonUniformMotionChart,
  "stationary-chart": StationaryChart,
  "path-types-diagram": PathTypesDiagram,
  "speedometer": () => <SpeedometerSVG />,
  "skateboarder": SkateboarderSVG,
  "car-reference": CarReferenceSVG,
  "force-vector-diagram": ForceVectorDiagram,
  "hanging-ball-forces": HangingBallForcesDiagram,
  "force-scale-drawing": ForceScaleDrawing,
  "spring-magnet-experiment": SpringMagnetExperiment,
  "book-on-table": BookOnTableFigure,
  "tug-of-war": TugOfWarFigure,
  "car-pullers": CarPullersFigure,
  "resultant-same-direction": ResultantSameDirectionFigure,
  "opposite-forces-ring": OppositeForcesRingFigure,
  "resultant-opposite-forces": ResultantOppositeForcesFigure,
  "direct-opposite-equal": DirectOppositeEqualForcesFigure,
  "action-reaction": ActionReactionFigure,
  "action-reaction-examples": ActionReactionExamplesGrid,
  "parachute": ParachuteFigure,
};

// رسوم محسّنة للشرح فقط؛ لا تدخل سجل رسوم دفتر الطالب.
const EXPLANATION_FIGURES: Record<string, () => ReactElement> = {
  "motion-explained-nonuniform": ExplainedNonUniformMotionChart,
  "motion-explained-speedometer": () => <ExplainedSpeedometerSVG />,
  "force-vector-explained": ForceVectorDiagramExplained,
  "force-spring-weight-explained": SpringWeightExplained,
  "force-mass-weight-explained": MassWeightExplained,
};

/** مواصفة طريقة الإنتاج للعرض */
const REPRO_LABEL: Record<FigureRef["reproduction"], string | null> = {
  redrawn: "رسم رقمي معاد إنتاجه",
  "enhanced-scan": "نسخة أصلية محسّنة من الكتاب",
  original: "صورة أصلية من الكتاب",
  none: null,
};

export function FigureBlock({ figure, caption }: { figure: FigureRef; caption?: Rich }) {
  const Svg = figure.kind === "svg" ? (EXPLANATION_FIGURES[figure.src] ?? FIGURES[figure.src]) : undefined;

  return (
    <figure className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-line)] px-5 py-3">
        {figure.bookPage != null && (
          <span className="badge-book">
            <BookOpen className="h-3.5 w-3.5" />
            من الكتاب — صفحة {figure.bookPage}
          </span>
        )}
        {REPRO_LABEL[figure.reproduction] && (
          <span className="badge-extra">
            <PenTool className="h-3.5 w-3.5" />
            {REPRO_LABEL[figure.reproduction]}
          </span>
        )}
        {figure.reproduction === "redrawn" && figure.bookPage == null && (
          <span className="badge-extra">
            <PenTool className="h-3.5 w-3.5" />
            رسم توضيحي إضافي
          </span>
        )}
      </div>
      <div className="flex justify-center bg-[rgba(6,14,30,0.45)] px-6 py-8">
        {Svg ? (
          <Svg />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={figure.src} alt={figure.alt} className="h-auto max-w-full rounded-xl" />
        )}
      </div>
      {caption && (
        <figcaption className="border-t border-[var(--color-line)] px-5 py-3.5 text-[13px] font-bold leading-7 text-[var(--color-mist)]">
          <RichText rich={caption} />
        </figcaption>
      )}
    </figure>
  );
}

/** نسخة الدفتر (ورقية) لرسم معيّن */
export function NotebookFigure({ figure }: { figure: FigureRef }) {
  const Svg = figure.kind === "svg" ? FIGURES[figure.src] : undefined;
  return (
    <div className="mt-3 flex justify-center rounded-xl border-2 border-[#c9b98c] bg-white/70 p-5">
      {Svg ? (
        <Svg />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={figure.src} alt={figure.alt} className="h-auto max-w-full" />
      )}
    </div>
  );
}
