"use client";

/**
 * الرسوم الأصلية لدرس «الضغط في السوائل» (الوحدة الثانية — الدرس الثاني، ص 71–80).
 *
 * اثنتا عشرة مجموعة، لكل مجموعة نسختان: لوحة واسعة ولوحة هاتف تحملان
 * المعلومات والتسميات نفسها بترتيب مختلف. كل صيغة رياضية تمرّ عبر `Label`
 * (KaTeX معزول LTR)، وكل تسمية عربية عبر `ArabicLabel` باتجاه RTL مستقل.
 * لا تُستعمل مؤشرات الجريان/المانومتر هنا كقراءات مقاسة؛ التوضيح العلمي
 * الدقيق موجود في المختبرات التفاعلية.
 */
import type { ReactNode } from "react";
import {
  ArabicLabel, C, Carrier, Label, Panel, Plate, PointMark, Vector,
} from "./pressure-drawing";

const W = {
  water: "#54b6e8",
  waterDeep: "#23608f",
  waterEdge: "#1b5a86",
  salt: "#9a72bd",
  saltEdge: "#6f4b94",
  oil: "#f0c451",
  oilEdge: "#a67c14",
  mazout: "#7b6b5d",
  air: "#dcecf8",
  red: C.red,
  blue: C.blue,
  gold: C.gold,
  green: C.green,
  violet: C.violet,
  ink: C.ink,
  ink2: C.ink2,
  rule: C.rule,
  guide: C.guide,
} as const;

const TEX = {
  law: String.raw`P=\rho g h`,
  total: String.raw`P_t=P_0+\rho g h`,
  density: String.raw`\rho=\dfrac{m}{V}`,
  relative: String.raw`D=\dfrac{\rho}{\rho_{\mathrm{H_2O}}}`,
  proofP: String.raw`P_A=P_B=P_C=P_D=P_E`,
  proofRho: String.raw`\rho g h_A=\rho g h_B=\rho g h_C=\rho g h_D=\rho g h_E`,
  proofH: String.raw`h_A=h_B=h_C=h_D=h_E`,
  atmPrinted: String.raw`1\,\mathrm{atm}=10135\,\mathrm{N/m^2}=760\,\mathrm{mmHg}`,
  atmCorrect: String.raw`1\,\mathrm{atm}=101325\,\mathrm{Pa}=760\,\mathrm{mmHg}`,
  p0Approx: String.raw`P_0\approx 1\times 10^5\,\mathrm{Pa}`,
  sixtyCm: String.raw`60\,\mathrm{cm}`,
  rhoUnits: String.raw`\mathrm{kg\cdot m^{-3}}`,
  gUnits: String.raw`\mathrm{m\cdot s^{-2}}`,
  pa: String.raw`\mathrm{Pa}`,
  h: String.raw`h`,
  pScale: String.raw`P\,(\times 10^5\,\mathrm{Pa})`,
  one: String.raw`1`,
  two: String.raw`2`,
  three: String.raw`3`,
  four: String.raw`4`,
  m: String.raw`\mathrm{m}`,
} as const;

function Backdrop({ w, h, fill = "#f7fafc" }: { w: number; h: number; fill?: string }) {
  return <rect x={4} y={4} width={w - 8} height={h - 8} rx={18} fill={fill} stroke={C.panelEdge} strokeWidth={1.6} />;
}

function Title({ w, text, sub, size = 21 }: { w: number; text: string; sub?: string; size?: number }) {
  return (
    <g>
      <ArabicLabel at={[w / 2, 34]} text={text} size={size} color={W.ink} weight={900} />
      {sub && <ArabicLabel at={[w / 2, 61]} text={sub} size={Math.max(13, size - 5)} color={W.ink2} weight={700} />}
    </g>
  );
}

function Dual({ title, desc, wideBox, narrowBox, wide, narrow, wideMax = "48rem", narrowMax = "23rem" }: {
  title: string; desc: string; wideBox: string; narrowBox: string;
  wide: ReactNode; narrow: ReactNode; wideMax?: string; narrowMax?: string;
}) {
  return (
    <>
      <Plate title={title} desc={desc} viewBox={wideBox} maxWidth={wideMax} variant="wide">{wide}</Plate>
      <Plate title={title} desc={desc} viewBox={narrowBox} maxWidth={narrowMax} variant="narrow">{narrow}</Plate>
    </>
  );
}

/** وعاء شفاف بسطح حرّ؛ لا يُستعمل أي تدرّج لزج قد يخفي الأسهم. */
function Vessel({ x, y, w, h, surfaceY, liquid = W.water, edge = W.waterEdge, opacity = 0.4 }: {
  x: number; y: number; w: number; h: number; surfaceY: number;
  liquid?: string; edge?: string; opacity?: number;
}) {
  const bottom = y + h;
  return (
    <g>
      <rect x={x + 3} y={surfaceY} width={w - 6} height={bottom - surfaceY - 3} rx={5} fill={liquid} opacity={opacity} />
      <path d={`M${x + 3} ${surfaceY} Q${x + w * 0.25} ${surfaceY - 5} ${x + w * 0.5} ${surfaceY} T${x + w - 3} ${surfaceY}`}
        fill="none" stroke={edge} strokeWidth={2.4} />
      <rect x={x} y={y} width={w} height={h} rx={10} fill="none" stroke={W.rule} strokeWidth={3} />
    </g>
  );
}

/** سهم ضغط عمودي على جدار/قاعدة: الطول بصري تعليمي فقط. */
function PressureArrow({ from, to, color = W.red, width = 4 }: { from: [number, number]; to: [number, number]; color?: string; width?: number }) {
  return <Vector from={from} to={to} color={color} width={width} />;
}

/** فوّارة ماء من ثقب: مسار بصري نسبي، وليس مدىً فيزيائياً مقاساً. */
function Jet({ x, y, reach, color = W.waterDeep, width = 4 }: { x: number; y: number; reach: number; color?: string; width?: number }) {
  const endX = x + reach;
  const endY = y + reach * 0.28;
  return (
    <g>
      <path d={`M${x} ${y} Q${x + reach * 0.55} ${y - 8} ${endX} ${endY}`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
      <circle cx={endX} cy={endY} r={4.5} fill={color} />
    </g>
  );
}

function ManometerGlyph({ x, y, scale = 1, gap = 34, capsuleAt, rotate = 0 }: {
  x: number; y: number; scale?: number; gap?: number;
  capsuleAt?: [number, number]; rotate?: number;
}) {
  const leftX = x + 70 * scale;
  const rightX = x + 150 * scale;
  const top = y;
  const bottom = y + 150 * scale;
  const mid = y + 88 * scale;
  const leftLevel = mid - gap / 2;
  const rightLevel = mid + gap / 2;
  return (
    <g transform={capsuleAt ? `translate(${capsuleAt[0]} ${capsuleAt[1]}) rotate(${rotate}) scale(${scale})` : undefined}>
      <rect x={x - 8 * scale} y={y - 12 * scale} width={236 * scale} height={180 * scale} rx={14 * scale}
        fill="#eef5fa" stroke={C.panelEdge} strokeWidth={1.5 * scale} />
      <path d={`M${leftX} ${bottom} L${leftX} ${top + 22 * scale} Q${leftX} ${top} ${leftX + 22 * scale} ${top} L${rightX - 22 * scale} ${top} Q${rightX} ${top} ${rightX} ${top + 22 * scale} L${rightX} ${bottom}`}
        fill="none" stroke={W.rule} strokeWidth={7 * scale} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={leftX - 6 * scale} y={leftLevel} width={12 * scale} height={bottom - leftLevel} fill={W.waterDeep} opacity={0.85} />
      <rect x={rightX - 6 * scale} y={rightLevel} width={12 * scale} height={bottom - rightLevel} fill={W.waterDeep} opacity={0.85} />
      <line x1={leftX - 20 * scale} y1={leftLevel} x2={rightX + 20 * scale} y2={leftLevel} stroke={C.guide} strokeWidth={1.4 * scale} strokeDasharray="5 4" />
      <line x1={leftX - 20 * scale} y1={rightLevel} x2={rightX + 20 * scale} y2={rightLevel} stroke={C.guide} strokeWidth={1.4 * scale} strokeDasharray="5 4" />
      <ArabicLabel at={[(leftX + rightX) / 2, top - 5 * scale]} text="فرق السويتين" size={13 * scale} color={W.ink2} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <line x1={x + 20 * scale} y1={top + (30 + i * 30) * scale} x2={x + 32 * scale} y2={top + (30 + i * 30) * scale} stroke={W.guide} strokeWidth={1.5 * scale} />
          <line x1={x + 196 * scale} y1={top + (30 + i * 30) * scale} x2={x + 208 * scale} y2={top + (30 + i * 30) * scale} stroke={W.guide} strokeWidth={1.5 * scale} />
        </g>
      ))}
    </g>
  );
}

/* ═════════════════════════════ 1) ص 71 — التمهيد ═════════════════════════════ */

export function LiquidPressureIntroFigure() {
  const wide = (
    <g>
      <Backdrop w={760} h={380} />
      <Title w={760} text="ماذا تسبّب السوائل في أوعيتها؟" sub="القاعدة والجدران · قوة عمودية · أثر يزداد مع العمق" />
      <Panel x={20} y={82} w={226} h={270} />
      <ArabicLabel at={[133, 110]} text="وعاء فيه ماء" size={17} color={W.blue} />
      <Vessel x={62} y={130} w={140} h={180} surfaceY={158} />
      <PressureArrow from={[132, 310]} to={[132, 342]} width={4} />
      <PressureArrow from={[62, 205]} to={[30, 205]} width={3.2} />
      <PressureArrow from={[62, 268]} to={[22, 268]} width={4.4} />
      <PressureArrow from={[202, 205]} to={[234, 205]} width={3.2} />
      <PressureArrow from={[202, 268]} to={[244, 268]} width={4.4} />
      <ArabicLabel at={[133, 334]} text="أسهم أطول عند الأسفل" size={14} color={W.red} />

      <Panel x={260} y={82} w={226} h={270} />
      <ArabicLabel at={[373, 110]} text="السدّ أمام الماء" size={17} color={W.blue} />
      <path d="M292 306 L330 142 L452 142 L470 306 Z" fill="#d9e4ee" stroke={W.rule} strokeWidth={2.5} />
      <rect x={292} y={180} width={178} height={126} fill={W.water} opacity={0.38} />
      <line x1={292} y1={180} x2={470} y2={180} stroke={W.waterEdge} strokeWidth={2.4} />
      <PressureArrow from={[320, 220]} to={[348, 220]} width={3} />
      <PressureArrow from={[320, 264]} to={[360, 264]} width={4} />
      <PressureArrow from={[320, 296]} to={[374, 296]} width={5.2} />
      <ArabicLabel at={[373, 334]} text="ضغط أكبر عند القاعدة" size={14} color={W.red} />

      <Panel x={500} y={82} w={240} h={270} />
      <ArabicLabel at={[620, 110]} text="الكلمات المفتاحية" size={17} color={W.blue} />
      {["ضغط السائل", "الكتلة الحجمية", "الأواني المستطرقة", "المانومتر"].map((t, i) => (
        <g key={t}>
          <rect x={520} y={136 + i * 48} width={200} height={36} rx={12} fill="#e8f2fb" stroke="#b9d2e8" strokeWidth={1.4} />
          <ArabicLabel at={[620, 160 + i * 48]} text={t} size={15} color={W.ink} weight={800} />
        </g>
      ))}
    </g>
  );
  const narrow = (
    <g>
      <Backdrop w={360} h={740} />
      <Title w={360} text="ماذا تسبّب السوائل في أوعيتها؟" sub="القاعدة والجدران · قوة عمودية" size={19} />
      <Panel x={14} y={78} w={332} h={198} />
      <Vessel x={112} y={104} w={136} h={140} surfaceY={128} />
      <PressureArrow from={[180, 244]} to={[180, 267]} width={4} />
      <PressureArrow from={[112, 170]} to={[84, 170]} width={3.2} />
      <PressureArrow from={[112, 218]} to={[72, 218]} width={4.6} />
      <PressureArrow from={[248, 170]} to={[276, 170]} width={3.2} />
      <PressureArrow from={[248, 218]} to={[288, 218]} width={4.6} />
      <ArabicLabel at={[180, 260]} text="أسهم أطول عند الأسفل" size={14} color={W.red} />

      <Panel x={14} y={288} w={332} h={188} />
      <ArabicLabel at={[180, 316]} text="السدّ أمام الماء" size={17} color={W.blue} />
      <path d="M58 452 L92 336 L286 336 L306 452 Z" fill="#d9e4ee" stroke={W.rule} strokeWidth={2.5} />
      <rect x={58} y={360} width={248} height={92} fill={W.water} opacity={0.38} />
      <line x1={58} y1={360} x2={306} y2={360} stroke={W.waterEdge} strokeWidth={2.4} />
      <PressureArrow from={[84, 388]} to={[116, 388]} width={3} />
      <PressureArrow from={[84, 422]} to={[128, 422]} width={4.4} />
      <ArabicLabel at={[180, 464]} text="ضغط أكبر عند القاعدة" size={14} color={W.red} />

      <Panel x={14} y={488} w={332} h={230} />
      <ArabicLabel at={[180, 516]} text="الكلمات المفتاحية" size={17} color={W.blue} />
      {["ضغط السائل", "الكتلة الحجمية", "الأواني المستطرقة", "المانومتر"].map((t, i) => (
        <g key={t}>
          <rect x={36} y={536 + i * 43} width={288} height={34} rx={11} fill="#e8f2fb" stroke="#b9d2e8" strokeWidth={1.4} />
          <ArabicLabel at={[180, 559 + i * 43]} text={t} size={15} color={W.ink} weight={800} />
        </g>
      ))}
    </g>
  );
  return <Dual title="تمهيد الدرس" desc="وعاء، سد، وكلمات مفتاحية من صفحة 71" wideBox="0 0 760 380" narrowBox="0 0 360 740" wide={wide} narrow={narrow} />;
}

/* ═════════════════════════════ 2) ص 72 — الثقوب الثلاثة ═════════════════════════════ */

export function ThreeHolesFigure() {
  const wide = (
    <g>
      <Backdrop w={760} h={420} />
      <Title w={760} text="الأنبوب المدرّج ذو الثقوب الثلاثة" sub="تُنزع السدادات بآن واحد · الاندفاع مختلف باختلاف العمق" />
      <Panel x={24} y={82} w={330} h={314} />
      <Vessel x={88} y={102} w={106} h={264} surfaceY={130} />
      {[178, 248, 318].map((y) => <circle key={y} cx={194} cy={y} r={7} fill="#fff" stroke={W.rule} strokeWidth={2.4} />)}
      {[85, 145, 215].map((reach, i) => <Jet key={i} x={194} y={178 + i * 70} reach={reach} width={3.4 + i} />)}
      <ArabicLabel at={[188, 388]} text="السدادات تُنزع معًا" size={14} color={W.blue} />

      <Panel x={370} y={82} w={366} h={314} />
      <ArabicLabel at={[553, 112]} text="ماذا نلاحظ؟" size={19} color={W.blue} />
      <rect x={392} y={138} width={322} height={56} rx={13} fill="#eef7fc" stroke="#b9d2e8" />
      <ArabicLabel at={[553, 172]} text="الأقرب للسطح: اندفاع أقل" size={16} color={W.ink} />
      <rect x={392} y={206} width={322} height={56} rx={13} fill="#eef7fc" stroke="#b9d2e8" />
      <ArabicLabel at={[553, 240]} text="الأوسط: اندفاع متوسّط" size={16} color={W.ink} />
      <rect x={392} y={274} width={322} height={56} rx={13} fill="#fff1f3" stroke="#e3aeb9" />
      <ArabicLabel at={[553, 308]} text="الأعمق: اندفاع أكثر" size={16} color={W.red} weight={900} />
      <ArabicLabel at={[553, 366]} text="قوة عمودية تزداد بازدياد عمق السائل" size={15} color={W.green} weight={800} />
    </g>
  );
  const narrow = (
    <g>
      <Backdrop w={360} h={650} />
      <Title w={360} text="الأنبوب ذو الثقوب الثلاثة" sub="تُنزع السدادات بآن واحد" size={19} />
      <Panel x={12} y={78} w={336} h={330} />
      <Vessel x={46} y={100} w={88} h={276} surfaceY={128} />
      {[180, 266, 350].map((y) => <circle key={y} cx={134} cy={y} r={6.5} fill="#fff" stroke={W.rule} strokeWidth={2.3} />)}
      {[58, 102, 158].map((reach, i) => <Jet key={i} x={134} y={180 + i * 86} reach={reach} width={3.2 + i} />)}
      <ArabicLabel at={[250, 172]} text="الأعلى: أقل" size={14} color={W.ink} />
      <ArabicLabel at={[250, 258]} text="الأوسط: متوسّط" size={14} color={W.ink} />
      <ArabicLabel at={[250, 344]} text="الأعمق: أكثر" size={15} color={W.red} weight={900} />
      <ArabicLabel at={[180, 392]} text="قوة عمودية تزداد بالعمق" size={14} color={W.green} weight={800} />

      <Panel x={12} y={420} w={336} h={208} />
      <ArabicLabel at={[180, 450]} text="خطوات التجربة" size={17} color={W.blue} />
      {[
        "أنبوب زجاجي مدرّج بثلاثة ثقوب",
        "سدادات مطاطية تغلق الثقوب",
        "نملأ الوعاء ماءً ونضعه على الحوض",
        "ننزع السدادات بآن واحد",
      ].map((t, i) => (
        <g key={t}>
          <circle cx={42} cy={486 + i * 34} r={11} fill="#e8f2fb" stroke="#b9d2e8" />
          <ArabicLabel at={[42, 490 + i * 34]} text={String(i + 1)} size={12} color={W.blue} weight={900} />
          <ArabicLabel at={[192, 490 + i * 34]} text={t} size={13.5} color={W.ink} anchor="middle" />
        </g>
      ))}
    </g>
  );
  return <Dual title="تجربة الثقوب الثلاثة" desc="ملاحظة الاندفاع وتدرّج العمق من صفحة 72" wideBox="0 0 760 420" narrowBox="0 0 360 650" wide={wide} narrow={narrow} />;
}

/* ═════════════════════════════ 3) ص 73 — أدوات المانومتر ═════════════════════════════ */

export function ManometerToolsFigure() {
  const tools = [
    ["مقياس ضغط السوائل", "المانومتر"],
    ["أوعية شفافة", "للمقارنة"],
    ["ماء", "سائل الأساس"],
    ["ماء ملون", "داخل الشعبتين"],
    ["محلول ملحي", "تجربة الكأسين"],
  ];
  const wide = (
    <g>
      <Backdrop w={760} h={360} />
      <Title w={760} text="أدوات تجربة المانومتر" sub="مقياس ضغط السوائل · أوعية شفافة · ماء · ماء ملون · محلول ملحي" />
      {tools.map(([name, note], i) => {
        const x = 22 + i * 146;
        return (
          <g key={name}>
            <Panel x={x} y={92} w={132} h={222} />
            <circle cx={x + 66} cy={154} r={36} fill="#e8f2fb" stroke="#9dbdd6" strokeWidth={2} />
            {i === 0 ? <ManometerGlyph x={x + 9} y={112} scale={0.28} gap={18} /> :
              i === 1 ? <rect x={x + 44} y={136} width={44} height={38} rx={5} fill="#fff" stroke={W.rule} strokeWidth={2.2} /> :
              i === 2 ? <path d={`M${x + 46} ${136} h40 v30 q-20 10 -40 0 Z`} fill={W.water} opacity={0.6} stroke={W.waterEdge} strokeWidth={2} /> :
              i === 3 ? <path d={`M${x + 46} ${136} h40 v30 q-20 10 -40 0 Z`} fill={W.waterDeep} opacity={0.85} stroke={W.waterEdge} strokeWidth={2} /> :
              <path d={`M${x + 46} ${136} h40 v30 q-20 10 -40 0 Z`} fill={W.salt} opacity={0.7} stroke={W.saltEdge} strokeWidth={2} />}
            <ArabicLabel at={[x + 66, 220]} text={name} size={14.5} color={W.ink} weight={800} />
            <ArabicLabel at={[x + 66, 252]} text={note} size={12.5} color={W.ink2} />
          </g>
        );
      })}
    </g>
  );
  const narrow = (
    <g>
      <Backdrop w={360} h={690} />
      <Title w={360} text="أدوات تجربة المانومتر" size={19} />
      {tools.map(([name, note], i) => (
        <g key={name}>
          <Panel x={16} y={78 + i * 118} w={328} h={104} />
          <circle cx={62} cy={130 + i * 118} r={28} fill="#e8f2fb" stroke="#9dbdd6" strokeWidth={2} />
          {i === 0 ? <ManometerGlyph x={24} y={98 + i * 118} scale={0.22} gap={16} /> :
            i === 1 ? <rect x={46} y={116 + i * 118} width={32} height={28} rx={4} fill="#fff" stroke={W.rule} strokeWidth={2} /> :
            i === 2 ? <path d={`M46 ${116 + i * 118} h32 v22 q-16 8 -32 0 Z`} fill={W.water} opacity={0.6} stroke={W.waterEdge} strokeWidth={2} /> :
            i === 3 ? <path d={`M46 ${116 + i * 118} h32 v22 q-16 8 -32 0 Z`} fill={W.waterDeep} opacity={0.85} stroke={W.waterEdge} strokeWidth={2} /> :
            <path d={`M46 ${116 + i * 118} h32 v22 q-16 8 -32 0 Z`} fill={W.salt} opacity={0.7} stroke={W.saltEdge} strokeWidth={2} />}
          <ArabicLabel at={[214, 132 + i * 118]} text={name} size={16} color={W.ink} weight={800} />
          <ArabicLabel at={[214, 158 + i * 118]} text={note} size={13} color={W.ink2} />
        </g>
      ))}
    </g>
  );
  return <Dual title="أدوات المانومتر" desc="الأدوات الخمس الواردة في صفحة 73" wideBox="0 0 760 360" narrowBox="0 0 360 690" wide={wide} narrow={narrow} />;
}

/* ═════════════════════════════ 4) ص 73 — تجربة المانومتر ═════════════════════════════ */

export function ManometerExperimentFigure() {
  const wide = (
    <g>
      <Backdrop w={760} h={430} />
      <Title w={760} text="ضغط السائل المتوازن في نقطة منه" sub="السوية الأفقية ذاتها · جميع الاتجاهات · فرق السويتين" />
      <Panel x={20} y={84} w={330} h={322} />
      <Vessel x={48} y={110} w={270} h={230} surfaceY={142} />
      <line x1={48} y1={256} x2={318} y2={256} stroke={W.green} strokeWidth={2} strokeDasharray="7 5" />
      {[[110, 256], [190, 256], [270, 256]].map(([x, y], i) => (
        <g key={x}>
          <circle cx={x} cy={y} r={13} fill="#fff" stroke={W.violet} strokeWidth={2.4} />
          <ArabicLabel at={[x, y + 4]} text={String.fromCharCode(65 + i)} size={12} color={W.violet} weight={900} />
        </g>
      ))}
      <ArabicLabel at={[183, 286]} text="سوية أفقية واحدة" size={14} color={W.green} />
      <g transform="translate(0 10)">
        <ellipse cx={183} cy={218} rx={22} ry={13} fill="#f5e6c8" stroke={W.gold} strokeWidth={2.4} />
        <ArabicLabel at={[183, 222]} text="حفّة ضغطية" size={11.5} color={W.gold} />
      </g>
      <Carrier from={[183, 205]} to={[390, 126]} color={W.guide} width={1.8} />

      <Panel x={364} y={84} w={376} h={322} />
      <ManometerGlyph x={402} y={112} scale={1.08} gap={42} />
      <ArabicLabel at={[552, 330]} text="فرق السويتين مؤشر بصري" size={14} color={W.ink2} />
      <ArabicLabel at={[552, 360]} text="لا يتغيّر بتدوير الغشاء" size={14} color={W.green} weight={800} />
      <ArabicLabel at={[552, 388]} text="أو بنقل الحفّة على السوية ذاتها" size={13.5} color={W.green} weight={800} />
    </g>
  );
  const narrow = (
    <g>
      <Backdrop w={360} h={720} />
      <Title w={360} text="تجربة المانومتر" sub="سوية واحدة · جميع الاتجاهات" size={19} />
      <Panel x={12} y={78} w={336} h={272} />
      <Vessel x={36} y={102} w={288} h={190} surfaceY={128} />
      <line x1={36} y1={220} x2={324} y2={220} stroke={W.green} strokeWidth={2} strokeDasharray="7 5" />
      {[[92, 220], [180, 220], [268, 220]].map(([x, y], i) => (
        <g key={x}>
          <circle cx={x} cy={y} r={12} fill="#fff" stroke={W.violet} strokeWidth={2.2} />
          <ArabicLabel at={[x, y + 4]} text={String.fromCharCode(65 + i)} size={11.5} color={W.violet} weight={900} />
        </g>
      ))}
      <ellipse cx={180} cy={188} rx={21} ry={12} fill="#f5e6c8" stroke={W.gold} strokeWidth={2.2} />
      <ArabicLabel at={[180, 192]} text="حفّة ضغطية" size={11} color={W.gold} />
      <ArabicLabel at={[180, 252]} text="سوية أفقية واحدة" size={14} color={W.green} />
      <ArabicLabel at={[180, 282]} text="نقل الحفّة لا يغيّر الفرق" size={13.5} color={W.ink2} />
      <ArabicLabel at={[180, 316]} text="تدوير الغشاء لا يغيّره أيضًا" size={13.5} color={W.ink2} />

      <Panel x={12} y={362} w={336} h={226} />
      <ManometerGlyph x={42} y={386} scale={0.95} gap={38} />
      <ArabicLabel at={[180, 564]} text="فرق السويتين مؤشر بصري" size={14} color={W.ink2} />

      <Panel x={12} y={600} w={336} h={98} />
      <ArabicLabel at={[180, 632]} text="الضغط متساوٍ من جميع الاتجاهات" size={15} color={W.green} weight={900} />
      <ArabicLabel at={[180, 666]} text="وعند جميع نقاط المستوي الأفقي" size={14} color={W.green} weight={800} />
    </g>
  );
  return <Dual title="تجربة المانومتر" desc="الحفّة الضغطية، السوية الأفقية، وتغيير الاتجاه من صفحة 73" wideBox="0 0 760 430" narrowBox="0 0 360 720" wide={wide} narrow={narrow} />;
}

/* ═════════════════════════════ 5) ص 74 — العمق ═════════════════════════════ */

export function DepthFigure() {
  const wide = (
    <g>
      <Backdrop w={760} h={390} />
      <Title w={760} text="العمق h عن سطح السائل الحرّ" sub="يزداد الضغط بازدياد h وينقص بنقصانه" />
      <Panel x={24} y={84} w={320} h={282} />
      <Vessel x={76} y={108} w={210} h={220} surfaceY={138} />
      {[190, 252, 312].map((y, i) => (
        <g key={y}>
          <line x1={286} y1={138} x2={286} y2={y} stroke={W.blue} strokeWidth={2} markerEnd="" />
          <line x1={280} y1={y} x2={292} y2={y} stroke={W.blue} strokeWidth={2} />
          <PointMark at={[181, y]} color={W.red} r={4} />
          <Label at={[318, (138 + y) / 2]} tex={String.raw`h_${i + 1}`} color={W.blue} size={16} width={46} />
        </g>
      ))}
      <ArabicLabel at={[181, 352]} text="سطح حرّ" size={14} color={W.waterEdge} />

      <Panel x={360} y={84} w={376} h={282} />
      <ArabicLabel at={[548, 120]} text="كلّما زاد العمق" size={18} color={W.blue} />
      <Label at={[548, 174]} tex={String.raw`P_1<P_2<P_3`} color={W.red} size={22} width={180} />
      <Label at={[548, 224]} tex={TEX.law} color={W.gold} size={24} width={180} />
      <ArabicLabel at={[548, 272]} text="الضغط طردي مع العمق" size={16} color={W.green} weight={800} />
      <ArabicLabel at={[548, 312]} text="عند ثبات الكتلة الحجمية و g" size={14} color={W.ink2} />
      <ArabicLabel at={[548, 344]} text="العمق يُقاس بالمتر m" size={14} color={W.ink2} />
    </g>
  );
  const narrow = (
    <g>
      <Backdrop w={360} h={650} />
      <Title w={360} text="العمق h" sub="من السطح الحرّ إلى النقطة" size={19} />
      <Panel x={12} y={78} w={336} h={310} />
      <Vessel x={66} y={102} w={190} h={236} surfaceY={130} />
      {[190, 256, 320].map((y, i) => (
        <g key={y}>
          <line x1={258} y1={130} x2={258} y2={y} stroke={W.blue} strokeWidth={2} />
          <line x1={252} y1={y} x2={264} y2={y} stroke={W.blue} strokeWidth={2} />
          <PointMark at={[150, y]} color={W.red} r={4} />
          <Label at={[292, (130 + y) / 2]} tex={String.raw`h_${i + 1}`} color={W.blue} size={16} width={44} />
        </g>
      ))}
      <ArabicLabel at={[150, 368]} text="سطح حرّ" size={14} color={W.waterEdge} />
      <Panel x={12} y={400} w={336} h={226} />
      <ArabicLabel at={[180, 434]} text="كلّما زاد العمق" size={17} color={W.blue} />
      <Label at={[180, 484]} tex={String.raw`P_1<P_2<P_3`} color={W.red} size={21} width={180} />
      <Label at={[180, 532]} tex={TEX.law} color={W.gold} size={22} width={180} />
      <ArabicLabel at={[180, 578]} text="الضغط طردي مع العمق" size={15} color={W.green} weight={800} />
      <ArabicLabel at={[180, 610]} text="العمق يُقاس بالمتر m" size={13.5} color={W.ink2} />
    </g>
  );
  return <Dual title="تغيّر الضغط مع العمق" desc="تعريف العمق h وترتيب الضغط من صفحة 74" wideBox="0 0 760 390" narrowBox="0 0 360 650" wide={wide} narrow={narrow} />;
}

/* ═════════════════════════════ 6) ص 74–75 — الكتلة الحجمية ═════════════════════════════ */

export function DensityFigure() {
  const wide = (
    <g>
      <Backdrop w={760} h={410} />
      <Title w={760} text="الكأسان: الماء ومحلول ملح الطعام" sub="الحفّة الضغطية على العمق ذاته · لا قيمة عددية لكثافة المحلول في الكتاب" />
      <Panel x={20} y={84} w={350} h={300} />
      <ArabicLabel at={[115, 112]} text="ماء" size={17} color={W.blue} />
      <Vessel x={60} y={128} w={110} h={190} surfaceY={154} liquid={W.water} edge={W.waterEdge} />
      <ellipse cx={115} cy={250} rx={20} ry={12} fill="#f5e6c8" stroke={W.gold} strokeWidth={2.2} />
      <ArabicLabel at={[115, 254]} text="حفّة" size={11.5} color={W.gold} />
      <ArabicLabel at={[275, 112]} text="محلول ملح الطعام" size={17} color={W.saltEdge} />
      <Vessel x={220} y={128} w={110} h={190} surfaceY={154} liquid={W.salt} edge={W.saltEdge} opacity={0.48} />
      <ellipse cx={275} cy={250} rx={20} ry={12} fill="#f5e6c8" stroke={W.gold} strokeWidth={2.2} />
      <ArabicLabel at={[275, 254]} text="حفّة" size={11.5} color={W.gold} />
      <line x1={60} y1={250} x2={330} y2={250} stroke={W.green} strokeWidth={2} strokeDasharray="6 5" />
      <ArabicLabel at={[195, 348]} text="العمق ذاته" size={15} color={W.green} weight={800} />

      <Panel x={386} y={84} w={354} h={300} />
      <ManometerGlyph x={414} y={104} scale={0.72} gap={22} />
      <ManometerGlyph x={570} y={104} scale={0.72} gap={52} />
      <ArabicLabel at={[490, 136]} text="الماء" size={14} color={W.blue} />
      <ArabicLabel at={[646, 136]} text="المحلول" size={14} color={W.saltEdge} />
      <Label at={[563, 246]} tex={String.raw`\rho_{\mathrm{salt}}>\rho_{\mathrm{water}}`} color={W.violet} size={18} width={210} />
      <ArabicLabel at={[563, 288]} text="ضغط المحلول أكبر عند العمق ذاته" size={15} color={W.red} weight={900} />
      <ArabicLabel at={[563, 326]} text="الفرق نوعي؛ الكتاب لم يُعطِ رقمًا" size={13.5} color={W.ink2} />
      <Label at={[563, 362]} tex={TEX.density} color={W.gold} size={18} width={170} />
    </g>
  );
  const narrow = (
    <g>
      <Backdrop w={360} h={720} />
      <Title w={360} text="الماء ومحلول الملح" sub="الحفّة على العمق ذاته" size={19} />
      <Panel x={12} y={78} w={336} h={260} />
      <ArabicLabel at={[98, 108]} text="ماء" size={16} color={W.blue} />
      <Vessel x={34} y={124} w={128} h={160} surfaceY={146} liquid={W.water} edge={W.waterEdge} />
      <ellipse cx={98} cy={220} rx={19} ry={11} fill="#f5e6c8" stroke={W.gold} strokeWidth={2} />
      <ArabicLabel at={[98, 224]} text="حفّة" size={11} color={W.gold} />
      <ArabicLabel at={[262, 108]} text="محلول ملح" size={16} color={W.saltEdge} />
      <Vessel x={198} y={124} w={128} h={160} surfaceY={146} liquid={W.salt} edge={W.saltEdge} opacity={0.48} />
      <ellipse cx={262} cy={220} rx={19} ry={11} fill="#f5e6c8" stroke={W.gold} strokeWidth={2} />
      <ArabicLabel at={[262, 224]} text="حفّة" size={11} color={W.gold} />
      <line x1={34} y1={220} x2={326} y2={220} stroke={W.green} strokeWidth={2} strokeDasharray="6 5" />
      <ArabicLabel at={[180, 312]} text="العمق ذاته" size={14} color={W.green} weight={800} />

      <Panel x={12} y={350} w={336} h={222} />
      <ManometerGlyph x={24} y={370} scale={0.6} gap={18} />
      <ManometerGlyph x={186} y={370} scale={0.6} gap={44} />
      <ArabicLabel at={[96, 408]} text="الماء" size={13} color={W.blue} />
      <ArabicLabel at={[258, 408]} text="المحلول" size={13} color={W.saltEdge} />
      <Label at={[180, 512]} tex={String.raw`\rho_{\mathrm{salt}}>\rho_{\mathrm{water}}`} color={W.violet} size={17} width={230} />
      <ArabicLabel at={[180, 548]} text="ضغط المحلول أكبر" size={15} color={W.red} weight={900} />

      <Panel x={12} y={584} w={336} h={116} />
      <Label at={[180, 620]} tex={TEX.density} color={W.gold} size={19} width={170} />
      <ArabicLabel at={[180, 660]} text="الفرق نوعي؛ لا رقم للملح في الكتاب" size={13} color={W.ink2} />
      <Label at={[180, 688]} tex={TEX.relative} color={W.violet} size={16} width={170} />
    </g>
  );
  return <Dual title="أثر الكتلة الحجمية" desc="تجربة الكأسين وتعريف الكثافة النسبية من صفحتي 74–75" wideBox="0 0 760 410" narrowBox="0 0 360 720" wide={wide} narrow={narrow} />;
}

/* ═════════════════════════════ 7) ص 75 — القانون ═════════════════════════════ */

export function LiquidLawFigure() {
  const wide = (
    <g>
      <Backdrop w={760} h={370} />
      <Title w={760} text="قانون الضغط في السوائل المتوازنة" sub="من ملاحظة العاملين إلى الصيغة الرياضية" />
      {[
        { x: 24, label: "عمق أكبر", tex: String.raw`h\uparrow`, color: W.blue, note: "P يزداد" },
        { x: 206, label: "كتلة حجمية أكبر", tex: String.raw`\rho\uparrow`, color: W.violet, note: "P يزداد" },
        { x: 388, label: "ثبات g", tex: String.raw`g=10`, color: W.green, note: "في مسائل الكتاب" },
        { x: 570, label: "المحصّلة", tex: TEX.law, color: W.gold, note: "ضغط السائل" },
      ].map((card, i) => (
        <g key={card.x}>
          <Panel x={card.x} y={96} w={166} h={166} />
          <ArabicLabel at={[card.x + 83, 126]} text={card.label} size={14.5} color={W.ink} weight={800} />
          <Label at={[card.x + 83, 180]} tex={card.tex} color={card.color} size={22} width={140} />
          <ArabicLabel at={[card.x + 83, 226]} text={card.note} size={13} color={W.ink2} />
          {i < 3 && <PressureArrow from={[card.x + 168, 180]} to={[card.x + 188, 180]} color={W.guide} width={3} />}
        </g>
      ))}
      <Panel x={24} y={278} w={712} h={68} />
      <ArabicLabel at={[130, 312]} text="الوحدات" size={16} color={W.blue} />
      <Label at={[310, 312]} tex={String.raw`P:\mathrm{Pa}`} color={W.gold} size={17} width={130} />
      <Label at={[470, 312]} tex={String.raw`\rho:\mathrm{kg\cdot m^{-3}}`} color={W.violet} size={17} width={190} />
      <Label at={[650, 312]} tex={String.raw`h:\mathrm{m}`} color={W.blue} size={17} width={110} />
    </g>
  );
  const narrow = (
    <g>
      <Backdrop w={360} h={690} />
      <Title w={360} text="قانون الضغط" sub="من العاملين إلى الصيغة" size={19} />
      {[
        { label: "عمق أكبر", tex: String.raw`h\uparrow`, color: W.blue, note: "P يزداد" },
        { label: "كتلة حجمية أكبر", tex: String.raw`\rho\uparrow`, color: W.violet, note: "P يزداد" },
        { label: "المحصّلة", tex: TEX.law, color: W.gold, note: "ضغط السائل" },
      ].map((card, i) => (
        <g key={card.label}>
          <Panel x={16} y={78 + i * 128} w={328} h={112} />
          <ArabicLabel at={[180, 108 + i * 128]} text={card.label} size={16} color={W.ink} weight={800} />
          <Label at={[180, 148 + i * 128]} tex={card.tex} color={card.color} size={23} width={180} />
          <ArabicLabel at={[180, 178 + i * 128]} text={card.note} size={13} color={W.ink2} />
        </g>
      ))}
      <Panel x={16} y={470} w={328} h={196} />
      <ArabicLabel at={[180, 502]} text="الوحدات" size={17} color={W.blue} />
      <Label at={[180, 540]} tex={String.raw`P:\mathrm{Pa}`} color={W.gold} size={18} width={150} />
      <Label at={[180, 578]} tex={String.raw`\rho:\mathrm{kg\cdot m^{-3}}`} color={W.violet} size={18} width={210} />
      <Label at={[180, 616]} tex={String.raw`g:\mathrm{m\cdot s^{-2}},\ h:\mathrm{m}`} color={W.blue} size={17} width={240} />
      <ArabicLabel at={[180, 650]} text="g = 10 في مسائل الكتاب" size={13} color={W.ink2} />
    </g>
  );
  return <Dual title="قانون ضغط السائل" desc="العاملان والوحدات من صفحة 75" wideBox="0 0 760 370" narrowBox="0 0 360 690" wide={wide} narrow={narrow} />;
}

/* ═════════════════════════════ 8) ص 76 — الضغط الجوي ═════════════════════════════ */

export function AtmosphereFigure() {
  const wide = (
    <g>
      <Backdrop w={760} h={430} />
      <Title w={760} text="الضغط الكلي والضغط الجوي" sub="سطح معرّض للهواء · وزن الغلاف · تصحيح علمي من المنصة" />
      <Panel x={20} y={84} w={290} h={322} />
      <path d="M45 330 Q165 250 285 330" fill="#cfe3f2" stroke={W.rule} strokeWidth={2.5} />
      <path d="M45 300 Q165 220 285 300" fill="none" stroke={W.blue} strokeWidth={3} strokeDasharray="7 6" />
      <path d="M45 270 Q165 190 285 270" fill="none" stroke={W.blue} strokeWidth={2.4} strokeDasharray="5 6" />
      <ArabicLabel at={[165, 214]} text="الأكسجين والتروجين" size={14} color={W.blue} />
      <ArabicLabel at={[165, 240]} text="وغازات أخرى" size={13} color={W.ink2} />
      <PressureArrow from={[165, 116]} to={[165, 178]} color={W.red} width={4.5} />
      <ArabicLabel at={[165, 108]} text="الجاذبية تشدّ الغاز" size={14} color={W.red} />
      <ArabicLabel at={[165, 362]} text="ضغط داخلي يكافئه" size={14} color={W.green} weight={800} />

      <Panel x={326} y={84} w={414} h={322} />
      <Label at={[533, 128]} tex={TEX.total} color={W.gold} size={22} width={260} />
      <ArabicLabel at={[533, 164]} text="مسائل ضغط السائل: P = ρgh وحده" size={14.5} color={W.blue} weight={800} />
      <ArabicLabel at={[533, 192]} text="المطبوع في الكتاب" size={14} color={W.ink2} />
      <Label at={[533, 222]} tex={TEX.atmPrinted} color={W.red} size={17} width={330} />
      <ArabicLabel at={[533, 254]} text="القيمة المطبوعة 10135 غير صحيحة" size={14} color={W.red} weight={800} />
      <ArabicLabel at={[533, 284]} text="تصحيح علمي من المنصة لا يُنسب للكتاب" size={13.5} color={W.violet} weight={800} />
      <Label at={[533, 318]} tex={TEX.atmCorrect} color={W.green} size={19} width={330} />
      <ArabicLabel at={[533, 356]} text="قمم الجبال · المناجم العميقة" size={13.5} color={W.ink2} />
      <ArabicLabel at={[533, 386]} text="نزف دموي · ضيق في التنفس" size={13.5} color={W.ink2} />
    </g>
  );
  const narrow = (
    <g>
      <Backdrop w={360} h={760} />
      <Title w={360} text="الضغط الجوي" sub="وزن الغلاف والتصحيح" size={19} />
      <Panel x={12} y={78} w={336} h={250} />
      <path d="M32 292 Q180 214 328 292" fill="#cfe3f2" stroke={W.rule} strokeWidth={2.4} />
      <path d="M32 264 Q180 188 328 264" fill="none" stroke={W.blue} strokeWidth={2.8} strokeDasharray="7 6" />
      <path d="M32 236 Q180 160 328 236" fill="none" stroke={W.blue} strokeWidth={2.2} strokeDasharray="5 6" />
      <ArabicLabel at={[180, 154]} text="الأكسجين والتروجين" size={14} color={W.blue} />
      <ArabicLabel at={[180, 180]} text="وغازات أخرى" size={13} color={W.ink2} />
      <PressureArrow from={[180, 92]} to={[180, 132]} color={W.red} width={4} />
      <ArabicLabel at={[180, 310]} text="ضغط داخلي يكافئه" size={14} color={W.green} weight={800} />

      <Panel x={12} y={340} w={336} h={220} />
      <Label at={[180, 376]} tex={TEX.total} color={W.gold} size={20} width={260} />
      <ArabicLabel at={[180, 412]} text="ضغط السائل: P = ρgh وحده" size={14} color={W.blue} weight={800} />
      <ArabicLabel at={[180, 446]} text="المطبوع في الكتاب" size={13.5} color={W.ink2} />
      <Label at={[180, 478]} tex={TEX.atmPrinted} color={W.red} size={15} width={320} />
      <ArabicLabel at={[180, 510]} text="10135 قيمة غير صحيحة" size={13.5} color={W.red} weight={800} />
      <ArabicLabel at={[180, 540]} text="تصحيح من المنصة" size={13.5} color={W.violet} weight={800} />

      <Panel x={12} y={572} w={336} h={166} />
      <Label at={[180, 608]} tex={TEX.atmCorrect} color={W.green} size={17} width={320} />
      <ArabicLabel at={[180, 646]} text="لا يُنسب إلى نصّ الكتاب الأصلي" size={13} color={W.violet} />
      <ArabicLabel at={[180, 680]} text="الجبال: نزف · المناجم: ضيق نفس" size={13} color={W.ink2} />
      <ArabicLabel at={[180, 714]} text="وحدة الضغط Pa لا N ولا rad ولا J" size={13} color={W.ink2} />
    </g>
  );
  return <Dual title="الضغط الجوي والتصحيح" desc="العلاقة الكلية، تركيب الغلاف، والقيمة المصححة من صفحة 76" wideBox="0 0 760 430" narrowBox="0 0 360 760" wide={wide} narrow={narrow} />;
}

/* ═════════════════════════════ 9) ص 77 — السدّ والأواني ═════════════════════════════ */

export function DamVesselsFigure() {
  const wide = (
    <g>
      <Backdrop w={760} h={440} />
      <Title w={760} text="السدّ والأواني المستطرقة" sub="قاعدة عريضة لضغط أكبر · سطح حرّ واحد في الفروع كافّة" />
      <Panel x={20} y={84} w={318} h={330} />
      <ArabicLabel at={[179, 112]} text="مقطع السدّ" size={17} color={W.blue} />
      <path d="M64 372 L108 146 L264 146 L296 372 Z" fill="#d9e4ee" stroke={W.rule} strokeWidth={2.6} />
      <rect x={64} y={186} width={232} height={186} fill={W.water} opacity={0.38} />
      <line x1={64} y1={186} x2={296} y2={186} stroke={W.waterEdge} strokeWidth={2.4} />
      <PressureArrow from={[92, 226]} to={[132, 226]} width={3} />
      <PressureArrow from={[92, 282]} to={[148, 282]} width={4.3} />
      <PressureArrow from={[92, 340]} to={[166, 340]} width={5.6} />
      <ArabicLabel at={[206, 214]} text="ضغط صغير" size={13.5} color={W.green} />
      <ArabicLabel at={[206, 348]} text="ضغط كبير" size={14} color={W.red} weight={900} />
      <ArabicLabel at={[179, 398]} text="عريض من الأسفل · ضيّق من الأعلى" size={13.5} color={W.ink2} />

      <Panel x={352} y={84} w={388} h={330} />
      <ArabicLabel at={[546, 112]} text="أوعية مختلفة متصلة من الأسفل" size={16} color={W.blue} />
      <path d="M382 190 H718" stroke={W.waterEdge} strokeWidth={2.6} />
      <path d="M394 190 V330 M466 190 V330 M538 190 V330 M610 190 V330 M682 190 V330" stroke={W.rule} strokeWidth={4} />
      <path d="M382 330 H718" stroke={W.rule} strokeWidth={4} />
      <rect x={382} y={190} width={336} height={140} fill={W.water} opacity={0.3} />
      {[394, 466, 538, 610, 682].map((x, i) => (
        <g key={x}>
          <PointMark at={[x, 286]} color={W.violet} r={3.8} />
          <ArabicLabel at={[x, 276]} text={String.fromCharCode(65 + i)} size={12} color={W.violet} weight={900} />
        </g>
      ))}
      <line x1={382} y1={286} x2={718} y2={286} stroke={W.green} strokeWidth={2} strokeDasharray="7 5" />
      <ArabicLabel at={[546, 358]} text="سوية أفقية واحدة للنقاط A–E" size={13.5} color={W.green} weight={800} />
      <Label at={[546, 386]} tex={TEX.proofH} color={W.gold} size={15} width={250} />
    </g>
  );
  const narrow = (
    <g>
      <Backdrop w={360} h={770} />
      <Title w={360} text="السدّ والأواني المستطرقة" size={18} />
      <Panel x={12} y={78} w={336} h={250} />
      <ArabicLabel at={[180, 106]} text="مقطع السدّ" size={16} color={W.blue} />
      <path d="M46 296 L82 132 L274 132 L310 296 Z" fill="#d9e4ee" stroke={W.rule} strokeWidth={2.4} />
      <rect x={46} y={162} width={264} height={134} fill={W.water} opacity={0.38} />
      <line x1={46} y1={162} x2={310} y2={162} stroke={W.waterEdge} strokeWidth={2.2} />
      <PressureArrow from={[72, 192]} to={[112, 192]} width={3} />
      <PressureArrow from={[72, 244]} to={[128, 244]} width={4} />
      <PressureArrow from={[72, 282]} to={[146, 282]} width={5.2} />
      <ArabicLabel at={[224, 188]} text="ضغط صغير" size={12.5} color={W.green} />
      <ArabicLabel at={[224, 284]} text="ضغط كبير" size={13.5} color={W.red} weight={900} />
      <ArabicLabel at={[180, 316]} text="عريض من الأسفل · ضيّق من الأعلى" size={12.5} color={W.ink2} />

      <Panel x={12} y={340} w={336} h={250} />
      <ArabicLabel at={[180, 368]} text="أوعية متصلة من الأسفل" size={15} color={W.blue} />
      <path d="M34 406 H326" stroke={W.waterEdge} strokeWidth={2.4} />
      <path d="M48 406 V536 M108 406 V536 M168 406 V536 M228 406 V536 M288 406 V536" stroke={W.rule} strokeWidth={3.6} />
      <path d="M34 536 H326" stroke={W.rule} strokeWidth={3.6} />
      <rect x={34} y={406} width={292} height={130} fill={W.water} opacity={0.3} />
      {[48, 108, 168, 228, 288].map((x, i) => (
        <g key={x}>
          <PointMark at={[x, 486]} color={W.violet} r={3.4} />
          <ArabicLabel at={[x, 476]} text={String.fromCharCode(65 + i)} size={11} color={W.violet} weight={900} />
        </g>
      ))}
      <line x1={34} y1={486} x2={326} y2={486} stroke={W.green} strokeWidth={1.8} strokeDasharray="6 5" />
      <ArabicLabel at={[180, 566]} text="سوية واحدة للنقاط A–E" size={13} color={W.green} weight={800} />

      <Panel x={12} y={602} w={336} h={146} />
      <Label at={[180, 634]} tex={TEX.proofP} color={W.violet} size={15} width={280} />
      <Label at={[180, 672]} tex={TEX.proofRho} color={W.gold} size={13.5} width={320} />
      <Label at={[180, 710]} tex={TEX.proofH} color={W.green} size={15} width={230} />
      <ArabicLabel at={[180, 738]} text="إذاً سوية الماء ذاتها" size={13} color={W.ink2} />
    </g>
  );
  return <Dual title="السدّ والأواني المستطرقة" desc="تصميم السد وبرهان تساوي السويات من صفحة 77" wideBox="0 0 760 440" narrowBox="0 0 360 770" wide={wide} narrow={narrow} />;
}

/* ═════════════════════════════ 10) ص 78 — تطبيقات ═════════════════════════════ */

export function LiquidApplicationsFigure() {
  const wide = (
    <g>
      <Backdrop w={760} h={410} />
      <Title w={760} text="تطبيقات وسياق أنشطة الكتاب" sub="أنبوب المنسوب · نشاط بحثي · مقارنة عند الارتفاع ذاته" />
      <Panel x={20} y={84} w={234} h={300} />
      <ArabicLabel at={[137, 112]} text="مستودع ماء–مازوت" size={16} color={W.blue} />
      <rect x={58} y={138} width={130} height={170} rx={8} fill="none" stroke={W.rule} strokeWidth={2.6} />
      <rect x={60} y={176} width={126} height={130} fill={W.water} opacity={0.4} />
      <rect x={60} y={282} width={126} height={24} fill={W.mazout} opacity={0.55} />
      <line x1={60} y1={176} x2={186} y2={176} stroke={W.waterEdge} strokeWidth={2.2} />
      <path d="M188 176 H216 V138" fill="none" stroke={W.rule} strokeWidth={4} />
      <rect x={210} y={138} width={12} height={170} fill={W.water} opacity={0.4} stroke={W.rule} strokeWidth={2} />
      <line x1={188} y1={176} x2={222} y2={176} stroke={W.green} strokeWidth={2} strokeDasharray="6 5" />
      <ArabicLabel at={[137, 340]} text="السوية ذاتها → يُعرف المنسوب" size={13.5} color={W.green} weight={800} />

      <Panel x={268} y={84} w={234} h={300} />
      <ArabicLabel at={[385, 112]} text="نشاط من الكتاب" size={16} color={W.violet} />
      <rect x={314} y={146} width={142} height={64} rx={14} fill="#eef2fa" stroke="#b9c8e0" />
      <rect x={330} y={210} width={18} height={80} fill={C.metal} stroke={C.metalEdge} strokeWidth={2} />
      <path d="M318 290 H410" stroke={W.rule} strokeWidth={3} />
      <ArabicLabel at={[385, 182]} text="كرسي طبيب الأسنان" size={14} color={W.ink} weight={800} />
      <ArabicLabel at={[385, 330]} text="أبحث مع زميلي في الشابكة" size={13.5} color={W.ink2} />
      <ArabicLabel at={[385, 358]} text="سياق النشاط فقط" size={12.5} color={W.violet} />

      <Panel x={516} y={84} w={224} h={300} />
      <ArabicLabel at={[628, 112]} text="عند الارتفاع ذاته" size={16} color={W.blue} />
      <Vessel x={548} y={140} w={66} h={168} surfaceY={164} liquid={W.water} edge={W.waterEdge} />
      <Vessel x={642} y={140} w={66} h={168} surfaceY={164} liquid={W.oil} edge={W.oilEdge} opacity={0.55} />
      <ArabicLabel at={[581, 328]} text="ماء" size={13} color={W.waterEdge} />
      <ArabicLabel at={[675, 328]} text="زيت" size={13} color={W.oilEdge} />
      <ArabicLabel at={[628, 358]} text="ضغط الماء أكبر" size={14} color={W.red} weight={800} />
    </g>
  );
  const narrow = (
    <g>
      <Backdrop w={360} h={730} />
      <Title w={360} text="تطبيقات الكتاب" size={19} />
      <Panel x={12} y={76} w={336} h={214} />
      <ArabicLabel at={[180, 104]} text="مستودع ماء–مازوت" size={16} color={W.blue} />
      <rect x={54} y={126} width={132} height={124} rx={7} fill="none" stroke={W.rule} strokeWidth={2.4} />
      <rect x={56} y={156} width={128} height={94} fill={W.water} opacity={0.4} />
      <rect x={56} y={228} width={128} height={20} fill={W.mazout} opacity={0.55} />
      <line x1={56} y1={156} x2={184} y2={156} stroke={W.waterEdge} strokeWidth={2} />
      <path d="M186 156 H222 V126" fill="none" stroke={W.rule} strokeWidth={3.5} />
      <rect x={216} y={126} width={12} height={124} fill={W.water} opacity={0.4} stroke={W.rule} strokeWidth={1.8} />
      <line x1={186} y1={156} x2={228} y2={156} stroke={W.green} strokeWidth={1.8} strokeDasharray="6 5" />
      <ArabicLabel at={[180, 274]} text="السوية ذاتها → يُعرف المنسوب" size={13} color={W.green} weight={800} />

      <Panel x={12} y={302} w={336} h={196} />
      <ArabicLabel at={[180, 330]} text="نشاط من الكتاب" size={16} color={W.violet} />
      <rect x={100} y={356} width={160} height={58} rx={13} fill="#eef2fa" stroke="#b9c8e0" />
      <rect x={172} y={414} width={18} height={52} fill={C.metal} stroke={C.metalEdge} strokeWidth={2} />
      <path d="M100 466 H262" stroke={W.rule} strokeWidth={3} />
      <ArabicLabel at={[180, 390]} text="كرسي طبيب الأسنان" size={14} color={W.ink} weight={800} />
      <ArabicLabel at={[180, 486]} text="أبحث مع زميلي في الشابكة" size={12.5} color={W.ink2} />

      <Panel x={12} y={510} w={336} h={198} />
      <ArabicLabel at={[180, 538]} text="عند الارتفاع ذاته" size={16} color={W.blue} />
      <Vessel x={62} y={560} w={92} h={112} surfaceY={580} liquid={W.water} edge={W.waterEdge} />
      <Vessel x={206} y={560} w={92} h={112} surfaceY={580} liquid={W.oil} edge={W.oilEdge} opacity={0.55} />
      <ArabicLabel at={[108, 686]} text="ماء" size={13} color={W.waterEdge} />
      <ArabicLabel at={[252, 686]} text="زيت" size={13} color={W.oilEdge} />
      <ArabicLabel at={[180, 700]} text="ضغط الماء أكبر" size={14} color={W.red} weight={800} />
    </g>
  );
  return <Dual title="تطبيقات وأنشطة" desc="الأنبوب الشفاف، كرسي طبيب الأسنان، ومقارنة الماء والزيت من صفحة 78" wideBox="0 0 760 410" narrowBox="0 0 360 730" wide={wide} narrow={narrow} />;
}

/* ═════════════════════════════ 11) ص 79 — شكل السؤال ═════════════════════════════ */

export function BookQuestionFigure() {
  const wide = (
    <g>
      <Backdrop w={760} h={400} />
      <Title w={760} text="شكل مسألة الكتاب — ص 79" sub="طبقة ماء زرقاء وطبقة زيت صفراء · الارتفاع 60 سم" />
      <Panel x={20} y={84} w={330} h={290} />
      <rect x={88} y={116} width={190} height={220} rx={8} fill="none" stroke={W.rule} strokeWidth={3} />
      <rect x={91} y={196} width={184} height={137} fill={W.water} opacity={0.55} />
      <rect x={91} y={119} width={184} height={77} fill={W.oil} opacity={0.65} />
      <line x1={91} y1={196} x2={275} y2={196} stroke={W.oilEdge} strokeWidth={2.4} />
      <line x1={300} y1={119} x2={300} y2={336} stroke={W.blue} strokeWidth={2.2} />
      <line x1={294} y1={119} x2={306} y2={119} stroke={W.blue} strokeWidth={2.2} />
      <line x1={294} y1={336} x2={306} y2={336} stroke={W.blue} strokeWidth={2.2} />
      <Label at={[300, 228]} tex={TEX.sixtyCm} color={W.blue} size={18} width={110} />
      <ArabicLabel at={[183, 166]} text="زيت" size={16} color={W.oilEdge} weight={800} />
      <ArabicLabel at={[183, 272]} text="ماء" size={16} color={W.waterEdge} weight={800} />
      <ArabicLabel at={[183, 356]} text="لا تُعطى كثافة الزيت في الكتاب" size={13} color={W.ink2} />

      <Panel x={366} y={84} w={374} h={290} />
      <ArabicLabel at={[553, 116]} text="العلاقات المستعملة في السؤال" size={16} color={W.blue} />
      {[
        "بدلة الغوص والأعماق الكبيرة",
        "ضغط الماء أكبر من ضغط الزيت",
        "الاندفاع من الأعلى أقلّ من الأسفل",
        "الأواني المستطرقة: سوية واحدة",
      ].map((t, i) => (
        <g key={t}>
          <rect x={388} y={142 + i * 52} width={330} height={42} rx={11} fill="#eef7fc" stroke="#b9d2e8" />
          <ArabicLabel at={[553, 169 + i * 52]} text={t} size={14} color={W.ink} weight={700} />
        </g>
      ))}
      <ArabicLabel at={[553, 352]} text="القيم والمعطيات كما وردت في الكتاب" size={13} color={W.ink2} />
    </g>
  );
  const narrow = (
    <g>
      <Backdrop w={360} h={650} />
      <Title w={360} text="شكل ص 79" sub="ماء وزيت · 60 سم" size={19} />
      <Panel x={12} y={76} w={336} h={280} />
      <rect x={92} y={102} width={176} height={210} rx={8} fill="none" stroke={W.rule} strokeWidth={3} />
      <rect x={95} y={180} width={170} height={129} fill={W.water} opacity={0.55} />
      <rect x={95} y={105} width={170} height={75} fill={W.oil} opacity={0.65} />
      <line x1={95} y1={180} x2={265} y2={180} stroke={W.oilEdge} strokeWidth={2.2} />
      <line x1={286} y1={102} x2={286} y2={312} stroke={W.blue} strokeWidth={2} />
      <line x1={280} y1={102} x2={292} y2={102} stroke={W.blue} strokeWidth={2} />
      <line x1={280} y1={312} x2={292} y2={312} stroke={W.blue} strokeWidth={2} />
      <Label at={[286, 208]} tex={TEX.sixtyCm} color={W.blue} size={17} width={100} />
      <ArabicLabel at={[180, 150]} text="زيت" size={16} color={W.oilEdge} weight={800} />
      <ArabicLabel at={[180, 250]} text="ماء" size={16} color={W.waterEdge} weight={800} />
      <ArabicLabel at={[180, 338]} text="لا تُعطى كثافة الزيت" size={13} color={W.ink2} />

      <Panel x={12} y={368} w={336} h={260} />
      <ArabicLabel at={[180, 398]} text="علاقات السؤال" size={16} color={W.blue} />
      {[
        "بدلة الغوص والأعماق",
        "الماء > الزيت",
        "الأعلى < الأسفل",
        "الأواني المستطرقة",
      ].map((t, i) => (
        <g key={t}>
          <rect x={34} y={420 + i * 48} width={292} height={38} rx={10} fill="#eef7fc" stroke="#b9d2e8" />
          <ArabicLabel at={[180, 445 + i * 48]} text={t} size={13.5} color={W.ink} weight={700} />
        </g>
      ))}
      <ArabicLabel at={[180, 612]} text="المعطيات كما وردت في الكتاب" size={12.5} color={W.ink2} />
    </g>
  );
  return <Dual title="شكل سؤال الكتاب" desc="طبقتا الماء والزيت وارتفاع 60 سم من صفحة 79" wideBox="0 0 760 400" narrowBox="0 0 360 650" wide={wide} narrow={narrow} />;
}

/* ═════════════════════════════ 12) ص 80 — الخط البياني ═════════════════════════════ */

export function LiquidGraphFigure() {
  const wide = (
    <g>
      <Backdrop w={760} h={440} />
      <Title w={760} text="الخط البياني للضغط الكلي بدلالة العمق" sub="شكل الرسم محفوظ كما ورد في الكتاب · توضيح المحور من المنصة" />
      <Panel x={20} y={84} w={720} h={332} />
      <ArabicLabel at={[380, 106]} text="الضغط (× 10⁵ Pa)" size={14} color={W.ink2} />
      <line x1={112} y1={132} x2={112} y2={334} stroke={W.ink} strokeWidth={2.6} />
      <line x1={112} y1={334} x2={676} y2={334} stroke={W.ink} strokeWidth={2.6} />
      {[1, 2, 3, 4].map((v) => {
        const y = 334 - v * 48;
        return (
          <g key={v}>
            <line x1={106} y1={y} x2={118} y2={y} stroke={W.ink} strokeWidth={2} />
            <Label at={[86, y]} tex={String(v)} color={W.ink} size={15} width={38} />
          </g>
        );
      })}
      <line x1={112} y1={286} x2={600} y2={190} stroke={W.red} strokeWidth={4} strokeLinecap="round" />
      <circle cx={356} cy={238} r={8} fill={W.red} stroke="#fff" strokeWidth={2} />
      <line x1={112} y1={238} x2={356} y2={238} stroke={W.red} strokeWidth={1.6} strokeDasharray="6 5" />
      <line x1={356} y1={334} x2={356} y2={238} stroke={W.red} strokeWidth={1.6} strokeDasharray="6 5" />
      <line x1={600} y1={334} x2={600} y2={190} stroke={W.red} strokeWidth={1.6} strokeDasharray="6 5" />
      <Label at={[356, 216]} tex={String.raw`2\times10^5`} color={W.red} size={15} width={120} />
      <Label at={[610, 190]} tex={String.raw`3\times10^5`} color={W.red} size={15} width={120} />
      <Label at={[210, 306]} tex={String.raw`P_0\approx1\times10^5`} color={W.green} size={15} width={180} />
      <ArabicLabel at={[664, 358]} text="m" size={16} color={W.blue} weight={900} />
      <ArabicLabel at={[380, 384]} text="المحور الأفقي: العمق h بالمتر m — توضيح من المنصة" size={14} color={W.violet} weight={800} />
      <Label at={[380, 410]} tex={TEX.total} color={W.gold} size={17} width={220} />
    </g>
  );
  const narrow = (
    <g>
      <Backdrop w={360} h={690} />
      <Title w={360} text="الخط البياني" sub="شكل الكتاب محفوظ" size={19} />
      <Panel x={12} y={76} w={336} h={330} />
      <ArabicLabel at={[180, 102]} text="الضغط (× 10⁵ Pa)" size={13} color={W.ink2} />
      <line x1={56} y1={126} x2={56} y2={314} stroke={W.ink} strokeWidth={2.3} />
      <line x1={56} y1={314} x2={324} y2={314} stroke={W.ink} strokeWidth={2.3} />
      {[1, 2, 3, 4].map((v) => {
        const y = 314 - v * 42;
        return (
          <g key={v}>
            <line x1={51} y1={y} x2={61} y2={y} stroke={W.ink} strokeWidth={1.8} />
            <Label at={[36, y]} tex={String(v)} color={W.ink} size={13} width={30} />
          </g>
        );
      })}
      <line x1={56} y1={272} x2={270} y2={188} stroke={W.red} strokeWidth={3.6} strokeLinecap="round" />
      <circle cx={163} cy={230} r={7} fill={W.red} stroke="#fff" strokeWidth={1.8} />
      <line x1={56} y1={230} x2={163} y2={230} stroke={W.red} strokeWidth={1.4} strokeDasharray="5 4" />
      <line x1={163} y1={314} x2={163} y2={230} stroke={W.red} strokeWidth={1.4} strokeDasharray="5 4" />
      <Label at={[163, 210]} tex={String.raw`2\times10^5`} color={W.red} size={13} width={100} />
      <Label at={[286, 188]} tex={String.raw`3\times10^5`} color={W.red} size={13} width={100} />
      <ArabicLabel at={[310, 338]} text="m" size={15} color={W.blue} weight={900} />
      <ArabicLabel at={[180, 368]} text="المحور الأفقي: العمق h" size={13} color={W.violet} weight={800} />
      <ArabicLabel at={[180, 390]} text="بالمتر m — توضيح من المنصة" size={12.5} color={W.violet} />

      <Panel x={12} y={418} w={336} h={250} />
      <Label at={[180, 452]} tex={TEX.law} color={W.gold} size={19} width={170} />
      <ArabicLabel at={[180, 484]} text="ضغط السائل طردي خطي مع العمق" size={13.5} color={W.ink} />
      <Label at={[180, 520]} tex={TEX.total} color={W.gold} size={18} width={210} />
      <ArabicLabel at={[180, 552]} text="لا يمرّ من المبدأ" size={14} color={W.red} weight={900} />
      <Label at={[180, 586]} tex={TEX.p0Approx} color={W.green} size={16} width={220} />
      <ArabicLabel at={[180, 618]} text="قيمة تقريبية في رسم الكتاب" size={12.5} color={W.ink2} />
      <Label at={[180, 648]} tex={TEX.atmCorrect} color={W.green} size={14} width={310} />
    </g>
  );
  return <Dual title="الخط البياني للضغط" desc="شكل صفحة 80 مع توضيح محور العمق والتصحيح العلمي" wideBox="0 0 760 440" narrowBox="0 0 360 690" wide={wide} narrow={narrow} />;
}
