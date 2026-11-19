import { AutoTex, SvgTeX } from "@/components/math/TeX";

/**
 * رسوم شرح إضافية لدرس القوة والحركة — للشرح فقط.
 * لا تُسجَّل في FIGURES ولا تصل إلى دفتر الطالب (انظر force-notebook-figures.test).
 */

const C = {
  blue: "#3b6cb5", teal: "#1a7a6d", coral: "#c4634a", ink: "#24304a",
  muted: "#6b7f9e", faint: "#b0bcc9", rule: "#e0ddd5", surface: "#ffffff",
};

function Frame({ children, w, h, title, caption }: {
  children: React.ReactNode; w: number; h: number; title: string; caption: string;
}) {
  return (
    <figure className="my-2">
      <div style={{ background: C.surface, border: `1.5px solid ${C.rule}`, borderRadius: 16, padding: 14, overflowX: "auto" }}>
        <svg viewBox={`0 0 ${w} ${h}`} style={{ minWidth: Math.min(w, 520) }} className="h-auto w-full block" role="img" aria-label={title}>
          <title>{title}</title>
          {children}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-[12.5px] leading-6" style={{ color: C.muted }}><AutoTex text={caption} /></figcaption>
    </figure>
  );
}

function Head({ x, y, angle, color, size = 14 }: { x: number; y: number; angle: number; color: string; size?: number }) {
  const a1 = angle + 0.42, a2 = angle - 0.42;
  return <polygon points={`${x},${y} ${x - size * Math.cos(a1)},${y - size * Math.sin(a1)} ${x - size * Math.cos(a2)},${y - size * Math.sin(a2)}`} fill={color} />;
}

/** نسخة شرح محسّنة من تمثيل القوة: تسمية الحامل على خطه نفسه وقياس شدة منطبق على الشعاع. */
export function ForceVectorDiagramExplained() {
  return (
    <Frame w={700} h={200} title="تمثيل القوة هندسيًا بشعاع — نسخة شرح محسّنة"
      caption="الحامل هو المستقيم الذي يقع عليه الشعاع نفسه، وخط قياس الشدة منطبق تمامًا على طرفي الشعاع">
      <line x1={40} y1={100} x2={660} y2={100} stroke={C.faint} strokeWidth={2} strokeDasharray="8 6" />
      <line x1={220} y1={100} x2={490} y2={100} stroke={C.coral} strokeWidth={5.5} strokeLinecap="round" />
      <Head x={496} y={100} angle={0} color={C.coral} size={16} />
      <circle cx={220} cy={100} r={7} fill={C.surface} stroke={C.ink} strokeWidth={3} />
      <circle cx={496} cy={100} r={7} fill={C.coral} stroke={C.coral} strokeWidth={3} />
      <SvgTeX tex="x'" x={20} y={72} width={26} height={20} color={C.muted} fontSize="16px" />
      <SvgTeX tex="x" x={648} y={72} width={22} height={20} color={C.muted} fontSize="16px" />
      <SvgTeX tex="O" x={206} y={60} width={22} height={20} color={C.ink} fontSize="17px" />
      <SvgTeX tex="B" x={484} y={60} width={22} height={20} color={C.coral} fontSize="17px" />
      <line x1={222} y1={72} x2={222} y2={93} stroke={C.ink} strokeWidth={1.5} strokeDasharray="3 3" />
      <line x1={494} y1={72} x2={494} y2={93} stroke={C.coral} strokeWidth={1.5} strokeDasharray="3 3" />
      <text x={222} y={52} textAnchor="middle" fill={C.ink} fontSize={12} fontWeight={700}>نقطة التأثير</text>
      <text x={494} y={52} textAnchor="middle" fill={C.coral} fontSize={12} fontWeight={700}>الجهة</text>
      {/* تسمية الحامل على خط الحامل نفسه مع خلفية تمحو التقطيع خلفها */}
      <rect x={52} y={88} width={76} height={24} rx={6} fill={C.surface} />
      <text x={118} y={104} textAnchor="end" fill={C.muted} fontSize={12} fontWeight={700}>الحامل</text>
      <SvgTeX tex="xx'" x={122} y={92} width={34} height={18} color={C.muted} fontSize="12px" />
      <line x1={220} y1={140} x2={496} y2={140} stroke={C.blue} strokeWidth={2.5} />
      <circle cx={220} cy={140} r={3.5} fill={C.blue} />
      <circle cx={496} cy={140} r={3.5} fill={C.blue} />
      <text x={358} y={168} textAnchor="middle" fill={C.blue} fontSize={14} fontWeight={800}>الشدة = طول الشعاع بمقياس الرسم</text>
      <SvgTeX tex="\vec{OB}" x={330} y={26} width={56} height={22} align="center" color={C.ink} fontSize="16px" />
    </Frame>
  );
}

/** تجربة الربيعة بأثقال متدرجة: الاستطالة تتناسب مع الثقل المعلّق. */
export function SpringWeightExplained() {
  const cases = [
    { w: "0 N", coils: 44, label: "بلا ثقل" },
    { w: "10 N", coils: 62, label: "ثقل أصغر" },
    { w: "20 N", coils: 80, label: "ثقل أكبر" },
  ];
  return (
    <Frame w={660} h={300} title="ربيعة تحمل أثقالًا متزايدة فتزداد استطالتها"
      caption="كلما ازداد الثقل المعلّق ازدادت استطالة الربيعة بالنسبة نفسها — وعلى هذا يعمل ميزان الربيعة">
      {cases.map((c, idx) => {
        const x = 110 + idx * 220;
        return (
          <g key={c.w}>
            <rect x={x - 32} y={24} width={64} height={14} rx={4} fill="#64748b" />
            {Array.from({ length: 6 }, (_, i) => {
              const seg = c.coils / 6;
              const y = 38 + i * seg;
              const dir = i % 2 === 0 ? 1 : -1;
              return <path key={i} d={`M${x},${y} Q${x + dir * 24},${y + seg / 2} ${x},${y + seg}`} fill="none" stroke={C.teal} strokeWidth={3.5} strokeLinecap="round" />;
            })}
            <rect x={x - 24} y={42 + c.coils} width={48} height={34} rx={8} fill={C.coral} />
            <SvgTeX tex={c.w.replace(" ", "\\,")} x={x - 26} y={48 + c.coils} width={52} height={20} align="center" color="#ffffff" fontSize="13px" />
            <line x1={x} y1={42 + c.coils + 44} x2={x} y2={42 + c.coils + 62} stroke={C.coral} strokeWidth={4} />
            <Head x={x} y={42 + c.coils + 68} angle={Math.PI / 2} color={C.coral} size={11} />
            <text x={x} y={236} textAnchor="middle" fill={C.muted} fontSize={12} fontWeight={700}>{c.label}</text>
            <SvgTeX tex={c.w.replace(" ", "\\,")} x={x - 30} y={246} width={60} height={20} align="middle" color={C.ink} fontSize="12px" />
          </g>
        );
      })}
      <text x={330} y={290} textAnchor="middle" fill={C.ink} fontSize={13} fontWeight={800}>الاستطالة تتضاعف عندما يتضاعف الثقل المعلّق</text>
    </Frame>
  );
}

/** الكتلة ثابتة والثقل يتغير بين الأرض والقمر. */
export function MassWeightExplained() {
  // طولا السهمين متناسبان مع الثقَلين الفعليين: w = m·g لنفس الكتلة (النسبة = نسبة g)
  const ARROW_EARTH = 66; // px عند g ≈ 9.8
  const arrowFor = (g: number) => ARROW_EARTH * (g / 9.8); // القمر: ≈ 11px
  const arrowTop = 204;
  // رأس السهم متناسب مع طول سهمه: طوله المحوري نسبة ثابتة من الطول الكلي.
  // الامتداد المحوري الفعلي للرأس في مكوّن Head يساوي size × cos(0.42)،
  // لذلك يُشتق size منه ويُنهى الخط عند قاعدة الرأس تمامًا.
  const HEAD_FRACTION = 0.22;
  const headSizeFor = (len: number) => (len * HEAD_FRACTION) / Math.cos(0.42);
  return (
    <Frame w={660} h={302} title="جسم واحد على الأرض والقمر: كتلة ثابتة وثقل مختلف"
      caption="الكتلة لا تتغير بتغيّر المكان، أما الثقل فيقلّ على القمر لأن جاذبيته أصغر بنحو ست مرات — وطول السهم يعبّر عن ذلك بالنسبة نفسها">
      {[0, 1].map(i => {
        const x = i === 0 ? 170 : 490;
        const moon = i === 1;
        const g = moon ? 1.62 : 9.8;
        const len = arrowFor(g);
        const headSize = headSizeFor(len);
        const shaftEnd = arrowTop + len - len * HEAD_FRACTION; // قاعدة الرأس
        return (
          <g key={i}>
            <circle cx={x} cy={86} r={44} fill={moon ? "#cbd5e1" : "#93c5fd"} stroke={moon ? "#94a3b8" : C.blue} strokeWidth={2.5} />
            <text x={x} y={80} textAnchor="middle" fill={C.ink} fontSize={13} fontWeight={800}>{moon ? "القمر" : "الأرض"}</text>
            <SvgTeX tex={moon ? "g \approx 1.62\,\text{N/kg}" : "g \approx 9.8\,\text{N/kg}"} x={x - 45} y={88} width={90} height={18} align="middle" color={C.muted} fontSize="11px" />
            <rect x={x - 34} y={164} width={68} height={40} rx={9} fill="#ffb03a" />
            <SvgTeX tex="m = 10\,\text{kg}" x={x - 40} y={177} width={80} height={20} align="middle" color="#1c1000" fontSize="12px" />
            <line x1={x} y1={arrowTop} x2={x} y2={shaftEnd} stroke={C.coral} strokeWidth={4.5} />
            <Head x={x} y={arrowTop + len} angle={Math.PI / 2} color={C.coral} size={headSize} />
            <SvgTeX tex={moon ? "w \approx 16\,\text{N}" : "w \approx 98\,\text{N}"} x={x - 45} y={280} width={90} height={20} align="middle" color={C.coral} fontSize="13px" />
          </g>
        );
      })}
      <text x={330} y={40} textAnchor="middle" fill={C.ink} fontSize={13} fontWeight={800}>الجسم نفسه — كتلة واحدة وثقلان مختلفان</text>
    </Frame>
  );
}
