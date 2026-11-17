import { SvgTeX } from "@/components/math/TeX";

/*
 * رسومات الدرس الثاني — أسلوب أكاديمي نظيف:
 * خلفية بيضاء دافئة، خطوط واضحة، ألوان هادئة محددة،
 * تسميات KaTeX دقيقة، أبعاد متناسبة.
 *
 * لوحة ألوان الرسومات:
 *  - أزرق القوة:   #3b6cb5
 *  - أخضر مائي:    #1a7a6d
 *  - مرجاني:       #c4634a
 *  - حبر داكن:     #24304a
 *  - رمادي خفيف:   #94a3b8
 *  - خلفية:        #fdfcf9
 */

const C = {
  blue: "#3b6cb5",
  teal: "#1a7a6d",
  coral: "#c4634a",
  ink: "#24304a",
  muted: "#6b7f9e",
  faint: "#b0bcc9",
  rule: "#e0ddd5",
  paper: "#fdfcf9",
  surface: "#ffffff",
  gold: "#8a6420",
  goldSoft: "#f9f3e6",
  red: "#c0392b",
  green: "#27864a",
};

function DiagramFrame({ children, w, h, title, caption }: {
  children: React.ReactNode; w: number; h: number;
  title: string; caption?: string;
}) {
  return (
    <figure className="my-2">
      <div style={{ background: C.surface, border: `1.5px solid ${C.rule}`, borderRadius: 16, padding: 14 }}>
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto block" role="img" aria-label={title}>
          <title>{title}</title>
          {children}
        </svg>
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-[12.5px] leading-6" style={{ color: C.muted }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function ArrowHead({ x, y, angle, color, size = 14 }: {
  x: number; y: number; angle: number; color: string; size?: number;
}) {
  const a1 = angle + 0.42;
  const a2 = angle - 0.42;
  const pts = `${x},${y} ${x - size * Math.cos(a1)},${y - size * Math.sin(a1)} ${x - size * Math.cos(a2)},${y - size * Math.sin(a2)}`;
  return <polygon points={pts} fill={color} />;
}

/* ═══════════════════════════════════════════════════════════
   1. تجربة النابض والمغناطيس والربيعة (ص 18)
   ═══════════════════════════════════════════════════════════ */
export function SpringMagnetExperiment() {
  return (
    <DiagramFrame w={720} h={340} title="تجربة ص 18: نابض حديدي ومغناطيس وربيعة"
      caption="التجربة 1: النابض والمغناطيس — التجربة 2: الربيعة والشد">

      {/* ─── التجربة 1: النابض على طاولة ─── */}
      {/* طاولة */}
      <rect x={30} y={200} width={280} height={12} rx={3} fill={C.faint} />
      <rect x={60} y={212} width={8} height={80} fill={C.faint} />
      <rect x={272} y={212} width={8} height={80} fill={C.faint} />

      {/* النابض الحديدي */}
      <rect x={100} y={178} width={120} height={22} rx={6} fill="#8898aa" stroke="#6b7f9e" strokeWidth={2} />
      {/* خطوط داخلية للنابض */}
      {[118, 140, 162, 184].map(x => (
        <line key={x} x1={x} y1={182} x2={x} y2={196} stroke="#a0aec0" strokeWidth={1.5} />
      ))}

      {/* المغناطيس */}
      <g transform="translate(310, 168)">
        {/* جسم المغناطيس */}
        <rect x={0} y={0} width={50} height={24} rx={5} fill={C.red} />
        <rect x={0} y={24} width={50} height={24} rx={5} fill={C.blue} />
        <text x={25} y={16} textAnchor="middle" fill="white" fontSize={12} fontWeight={800}>N</text>
        <text x={25} y={40} textAnchor="middle" fill="white" fontSize={12} fontWeight={800}>S</text>
      </g>

      {/* سهم القوة المغناطيسية */}
      <line x1={295} y1={189} x2={234} y2={189} stroke={C.blue} strokeWidth={4.5} strokeLinecap="round" />
      <ArrowHead x={228} y={189} angle={Math.PI} color={C.blue} />

      {/* تسمية (1) */}
      <SvgTeX tex="(1)" x={140} y={148} width={40} height={22} align="center" color={C.ink} fontSize="16px" />

      {/* خطوط الجذب */}
      {[0, 8, -8].map((dy, i) => (
        <line key={i} x1={305} y1={186 + dy} x2={280} y2={189 + dy * 0.3}
          stroke={C.muted} strokeWidth={1} strokeDasharray="3 4" opacity={0.5} />
      ))}

      {/* ─── التجربة 2: الربيعة المعلقة ─── */}
      {/* نقطة التثبيت */}
      <rect x={478} y={30} width={64} height={14} rx={4} fill="#64748b" />
      <line x1={510} y1={44} x2={510} y2={68} stroke="#64748b" strokeWidth={4} />

      {/* ملفات الربيعة */}
      {Array.from({ length: 7 }, (_, i) => {
        const y = 68 + i * 22;
        const dir = i % 2 === 0 ? 1 : -1;
        return (
          <path key={i}
            d={`M510,${y} Q${510 + dir * 28},${y + 11} 510,${y + 22}`}
            fill="none" stroke={C.teal} strokeWidth={3.5} strokeLinecap="round" />
        );
      })}

      {/* الثقل */}
      <rect x={488} y={222} width={44} height={32} rx={8} fill={C.coral} />
      <text x={510} y={244} textAnchor="middle" fill="white" fontSize={11} fontWeight={700}>ثقل</text>

      {/* خط التعليق */}
      <line x1={510} y1={254} x2={510} y2={270} stroke="#64748b" strokeWidth={3} />

      {/* يد تشد الربيعة */}
      <g transform="translate(530, 260)">
        <path d="M0,0 Q18,-8 30,-4 Q42,0 38,14 Q34,26 18,24 Q4,22 0,12 Z"
          fill="#f5d0b0" stroke="#d4a574" strokeWidth={1.5} />
        <line x1={0} y1={12} x2={-22} y2={12} stroke={C.coral} strokeWidth={4} strokeLinecap="round" />
        <ArrowHead x={-28} y={12} angle={Math.PI} color={C.coral} size={10} />
      </g>

      {/* سهم F */}
      <line x1={555} y1={170} x2={600} y2={170} stroke={C.coral} strokeWidth={4.5} strokeLinecap="round" />
      <ArrowHead x={606} y={170} angle={0} color={C.coral} />
      <SvgTeX tex="\vec{F}" x={610} y={160} width={30} height={22} color={C.coral} fontSize="17px" />

      {/* تسمية (2) */}
      <SvgTeX tex="(2)" x={540} y={86} width={40} height={22} align="center" color={C.ink} fontSize="16px" />

      {/* خط فاصل */}
      <line x1={400} y1={30} x2={400} y2={300} stroke={C.rule} strokeWidth={1.5} strokeDasharray="6 8" />

      {/* تسميات عامة */}
      <text x={170} y={310} textAnchor="middle" fill={C.muted} fontSize={13} fontWeight={700}>
        النابض يتحرك بتأثير المغناطيس
      </text>
      <text x={540} y={310} textAnchor="middle" fill={C.muted} fontSize={13} fontWeight={700}>
        الربيعة يتغيّر شكلها بتأثير الشدّ
      </text>
    </DiagramFrame>
  );
}

/* ═══════════════════════════════════════════════════════════
   2. تمثيل القوة شعاعيًا (ص 21)
   ═══════════════════════════════════════════════════════════ */
export function ForceVectorDiagram() {
  return (
    <DiagramFrame w={700} h={200} title="تمثيل القوة هندسيًا بشعاع — ص 21"
      caption="الشعاع OB يمثل القوة بعناصرها الأربعة: نقطة التأثير O، الحامل xx′، الجهة نحو B، والشدة (طول الشعاع)">

      {/* الحامل xx' */}
      <line x1={40} y1={100} x2={660} y2={100} stroke={C.faint} strokeWidth={2} strokeDasharray="8 6" />

      {/* شعاع القوة OB */}
      <line x1={220} y1={100} x2={490} y2={100} stroke={C.coral} strokeWidth={5.5} strokeLinecap="round" />
      <ArrowHead x={496} y={100} angle={0} color={C.coral} size={16} />

      {/* نقطة O */}
      <circle cx={220} cy={100} r={7} fill={C.surface} stroke={C.ink} strokeWidth={3} />
      {/* نقطة B */}
      <circle cx={496} cy={100} r={7} fill={C.coral} stroke={C.coral} strokeWidth={3} />

      {/* تسميات */}
      <SvgTeX tex="x'" x={20} y={72} width={26} height={20} color={C.muted} fontSize="16px" />
      <SvgTeX tex="x" x={648} y={72} width={22} height={20} color={C.muted} fontSize="16px" />
      <SvgTeX tex="O" x={206} y={60} width={22} height={20} color={C.ink} fontSize="17px" />
      <SvgTeX tex="B" x={484} y={60} width={22} height={20} color={C.coral} fontSize="17px" />

      {/* خطوط توضيحية */}
      <line x1={222} y1={72} x2={222} y2={93} stroke={C.ink} strokeWidth={1.5} strokeDasharray="3 3" />
      <line x1={494} y1={72} x2={494} y2={93} stroke={C.coral} strokeWidth={1.5} strokeDasharray="3 3" />

      {/* تسمية "نقطة التأثير" */}
      <text x={222} y={52} textAnchor="middle" fill={C.ink} fontSize={12} fontWeight={700}>نقطة التأثير</text>

      {/* تسمية "الجهة" */}
      <text x={494} y={52} textAnchor="middle" fill={C.coral} fontSize={12} fontWeight={700}>الجهة</text>

      {/* تسمية "الحامل" */}
      <text x={100} y={132} textAnchor="middle" fill={C.muted} fontSize={12} fontWeight={700}>الحامل</text>

      {/* قوسان للشدة */}
      <line x1={224} y1={140} x2={492} y2={140} stroke={C.blue} strokeWidth={2.5} />
      <circle cx={224} cy={140} r={3.5} fill={C.blue} />
      <circle cx={492} cy={140} r={3.5} fill={C.blue} />
      <text x={358} y={168} textAnchor="middle" fill={C.blue} fontSize={14} fontWeight={800}>الشدة</text>

      {/* OB vector label */}
      <SvgTeX tex="\vec{OB}" x={330} y={26} width={56} height={22} align="center" color={C.ink} fontSize="16px" />
    </DiagramFrame>
  );
}

/* ═══════════════════════════════════════════════════════════
   3. الكرة المعلقة بحبل (ص 28)
   ═══════════════════════════════════════════════════════════ */
export function HangingBallForcesDiagram() {
  return (
    <DiagramFrame w={280} h={420} title="كرة كتلتها 100g معلقة بحبل يؤثر فيها قوتان — ص 28"
      caption="قوة الثقل w نحو الأسفل وقوة شد الحبل t نحو الأعلى">

      {/* نقطة التثبيت */}
      <rect x={100} y={20} width={80} height={16} rx={5} fill="#64748b" />
      <rect x={136} y={36} width={8} height={4} fill="#64748b" />

      {/* الحبل */}
      <line x1={140} y1={40} x2={140} y2={150} stroke="#475569" strokeWidth={3.5} strokeLinecap="round" />

      {/* الكرة */}
      <defs>
        <radialGradient id="ballGrad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </radialGradient>
      </defs>
      <circle cx={140} cy={195} r={44} fill="url(#ballGrad)" stroke="#1d4ed8" strokeWidth={2.5} />

      {/* كتلة الكرة */}
      <SvgTeX tex="100\,\text{g}" x={105} y={188} width={70} height={20} align="center" color="#ffffff" fontSize="14px" />

      {/* سهم قوة الشد t (أزرق مائي لأعلى) */}
      <line x1={140} y1={145} x2={140} y2={62} stroke={C.teal} strokeWidth={5} strokeLinecap="round" />
      <ArrowHead x={140} y={56} angle={-Math.PI / 2} color={C.teal} size={15} />
      <SvgTeX tex="\vec{t}" x={154} y={80} width={30} height={22} color={C.teal} fontSize="18px" />

      {/* سهم قوة الثقل w (مرجاني لأسفل) */}
      <line x1={140} y1={244} x2={140} y2={340} stroke={C.coral} strokeWidth={5} strokeLinecap="round" />
      <ArrowHead x={140} y={346} angle={Math.PI / 2} color={C.coral} size={15} />
      <SvgTeX tex="\vec{w}" x={154} y={306} width={30} height={22} color={C.coral} fontSize="18px" />

      {/* نقطة مركز الثقل */}
      <circle cx={140} cy={195} r={4} fill={C.surface} stroke={C.ink} strokeWidth={2} />

      {/* أسطورة */}
      <g transform="translate(30, 382)">
        <line x1={0} y1={6} x2={24} y2={6} stroke={C.teal} strokeWidth={3.5} />
        <text x={30} y={10} fill={C.muted} fontSize={11} fontWeight={600}>قوة الشد</text>
        <line x1={120} y1={6} x2={144} y2={6} stroke={C.coral} strokeWidth={3.5} />
        <text x={150} y={10} fill={C.muted} fontSize={11} fontWeight={600}>قوة الثقل</text>
      </g>
    </DiagramFrame>
  );
}

/* ═══════════════════════════════════════════════════════════
   4. تمثيل القوى الثلاث بمقياس رسم (ص 27)
   ═══════════════════════════════════════════════════════════ */
export function ForceScaleDrawing() {
  const origin = { x: 140, y: 260 };
  const pxPerN = 4; // 1 N = 4 px (مقياس: 1cm = 10N → 10 N = 40px)
  const forces: { F: number; deg: number; color: string; label: string }[] = [
    { F: 40, deg: 0,    color: C.blue,  label: "40\\,\\text{N}" },
    { F: 30, deg: -90,  color: C.teal,  label: "30\\,\\text{N}" },
    { F: 50, deg: 45,   color: C.coral, label: "50\\,\\text{N}" },
  ];

  return (
    <DiagramFrame w={520} h={380} title="تمثيل القوى الثلاث بمقياس رسم — ص 27"
      caption="مقياس الرسم: كل 1 cm يقابل 10 N — القوى مطبقة في النقطة B">

      {/* محاور مساعدة */}
      <line x1={40} y1={origin.y} x2={480} y2={origin.y} stroke={C.rule} strokeWidth={1.5} strokeDasharray="6 8" />
      <line x1={origin.x} y1={20} x2={origin.x} y2={360} stroke={C.rule} strokeWidth={1.5} strokeDasharray="6 8" />

      {/* نقطة B */}
      <circle cx={origin.x} cy={origin.y} r={7} fill={C.surface} stroke={C.ink} strokeWidth={3} />
      <SvgTeX tex="B" x={origin.x + 12} y={origin.y - 18} width={20} height={18} color={C.ink} fontSize="15px" />

      {/* القوى */}
      {forces.map((f, i) => {
        const rad = (f.deg * Math.PI) / 180;
        const len = f.F * pxPerN;
        const ex = origin.x + Math.cos(rad) * len;
        const ey = origin.y - Math.sin(rad) * len;
        const lx = (origin.x + ex) / 2 + 16 * Math.sin(rad);
        const ly = (origin.y + ey) / 2 - 16 * Math.cos(rad);

        return (
          <g key={i}>
            <line x1={origin.x} y1={origin.y} x2={ex} y2={ey}
              stroke={f.color} strokeWidth={4.5} strokeLinecap="round" />
            <ArrowHead x={ex} y={ey} angle={Math.atan2(-(ey - origin.y), ex - origin.x)} color={f.color} />
            <SvgTeX tex={f.label} x={lx - 28} y={ly - 12} width={60} height={20} color={f.color} fontSize="13px" />
          </g>
        );
      })}

      {/* قوس الزاوية 45° */}
      <path d={`M${origin.x + 40},${origin.y} A40,40 0 0,0 ${origin.x + 40 * Math.cos(Math.PI / 4)},${origin.y - 40 * Math.sin(Math.PI / 4)}`}
        fill="none" stroke={C.gold} strokeWidth={2} />
      <SvgTeX tex="45^\circ" x={origin.x + 44} y={origin.y - 38} width={40} height={18} color={C.gold} fontSize="13px" />

      {/* مقياس الرسم */}
      <g transform="translate(340, 330)">
        <line x1={0} y1={0} x2={40} y2={0} stroke={C.ink} strokeWidth={2.5} />
        <line x1={0} y1={-6} x2={0} y2={6} stroke={C.ink} strokeWidth={2} />
        <line x1={40} y1={-6} x2={40} y2={6} stroke={C.ink} strokeWidth={2} />
        <text x={20} y={-10} textAnchor="middle" fill={C.muted} fontSize={11} fontWeight={700}>1 cm</text>
        <text x={20} y={22} textAnchor="middle" fill={C.muted} fontSize={11} fontWeight={700}>= 10 N</text>
      </g>

      {/* أسطورة */}
      <g transform="translate(340, 26)">
        {forces.map((f, i) => (
          <g key={i} transform={`translate(0, ${i * 22})`}>
            <line x1={0} y1={6} x2={24} y2={6} stroke={f.color} strokeWidth={3.5} strokeLinecap="round" />
            <text x={30} y={10} fill={C.muted} fontSize={11} fontWeight={600}>
              {i === 0 ? "أفقية → يمين" : i === 1 ? "شاقولية ↓ أسفل" : "45° ↗ أعلى"}
            </text>
          </g>
        ))}
      </g>
    </DiagramFrame>
  );
}
