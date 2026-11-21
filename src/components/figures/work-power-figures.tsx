"use client";

/**
 * الرسوم الخمسة للدرس الرابع «العمل والاستطاعة».
 * كل رسم يعتمد النظام الموحّد في `work-power-drawing.tsx`
 * (سهم/إسناد/تسمية LTR/مقياس لوني)، ويعرض نسختين: واسعة وهاتف.
 */
import {
  C, S, Plate, Vector, Label, Carrier, Ground, Measure, RightAngle, PointMark, ArabicLabel, Panel, Crate,
} from "./work-power-drawing";

/* ═══════════════ 1) شخص يدفع سيارة متوقفة (ص 41) ═══════════════ */

function Pusher({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  /* رجل بوقفة دفع جانبية (القدمان على nível الأرض): الساقان مثبتتان بزاوية،
     الجذع مائل قليلاً إلى الأمام، والذراعان ممتدتان إلى الأمام عند مستوى الصدر.
     الوحدة المحلية: القدمان عند y=0 والطول الكلي 122. */
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} strokeLinecap="round" strokeLinejoin="round">
      {/* الساق الخلفية الممدودة */}
      <path d="M2 -62 L-16 -30 L-30 0" stroke={C.bodyEdge} strokeWidth={12} fill="none" />
      <path d="M-42 0 L-20 0" stroke={C.ink} strokeWidth={9} fill="none" />
      {/* الساق الأمامية المثنية */}
      <path d="M2 -62 L16 -30 L30 0" stroke={C.bodyEdge} strokeWidth={12} fill="none" />
      <path d="M20 0 L40 0" stroke={C.ink} strokeWidth={9} fill="none" />
      {/* الجذع */}
      <path d="M2 -62 L10 -96" stroke={C.bodyEdge} strokeWidth={16} fill="none" />
      {/* الرأس */}
      <circle cx={16} cy={-108} r={12} fill="#e0b48f" stroke={C.bodyEdge} strokeWidth={2.4} />
      <path d="M6 -114 q12 -9 21 2" stroke={C.ink} strokeWidth={4} fill="none" />
      {/* الذراعان: كتف ← مرفق ← يد */}
      <path d="M10 -92 L32 -80 L48 -72" stroke={C.bodyEdge} strokeWidth={8.5} fill="none" />
      <path d="M8 -86 L28 -72 L44 -62" stroke={C.bodyEdge} strokeWidth={7.5} fill="none" />
      <circle cx={50} cy={-72} r={3.8} fill="#e0b48f" stroke={C.bodyEdge} strokeWidth={1.6} />
      <circle cx={46} cy={-62} r={3.4} fill="#e0b48f" stroke={C.bodyEdge} strokeWidth={1.6} />
    </g>
  );
}

export function WorkStoppedCarFigure() {
  // العربية على مستوى الأرض: قاع العجلات = سطح الأرض في النسختين.
  const car = (
    <>
      <path
        d="M236 196 L236 176 Q236 168 244 166 L264 163 Q276 132 312 128 L372 128 Q406 131 424 161 L470 166 Q480 169 480 178 L480 196 Z"
        fill={C.body} stroke={C.bodyEdge} strokeWidth={3} strokeLinejoin="round"
      />
      <path d="M282 158 L308 136 L372 136 L372 158 Z" fill="#ffffff" stroke={C.bodyEdge} strokeWidth={2} strokeLinejoin="round" />
      <path d="M380 136 L402 136 Q416 138 424 158 L380 158 Z" fill="#ffffff" stroke={C.bodyEdge} strokeWidth={2} strokeLinejoin="round" />
      <circle cx={266} cy={196} r={21} fill="#28384c" />
      <circle cx={266} cy={196} r={8} fill="#dfe8ee" />
      <circle cx={446} cy={196} r={21} fill="#28384c" />
      <circle cx={446} cy={196} r={8} fill="#dfe8ee" />
    </>
  );

  return (
    <>
      <Plate variant="wide" viewBox="0 0 620 300" title="شخص يدفع سيارة متوقفة: توجد قوة ولا يظهر انتقال"
        desc="رجل يدفع مؤخرة سيارة ساكنة. سهم القوة F إلى اليمين عند نقطة التلامس، ولا تنتقل السيارة، فالمسافة d تساوي صفراً والعمل معدوم."
        maxWidth="44rem">
        <Ground x1={40} x2={580} y={218} />
        {car}
        <Pusher x={198} y={212} scale={0.86} />
        {/* نقطة التلامس (اليدان على الهيكل) ⇒ خط إسناد إلى سهم القوة الحرّ */}
        <PointMark at={[238, 158]} color={C.red} />
        <Carrier from={[238, 152]} to={[238, 84]} color={C.red} width={1.7} />
        <Vector from={[160, 84]} to={[288, 84]} color={C.red} width={S.force} />
        <PointMark at={[238, 84]} color={C.red} />
        <Label at={[214, 56]} tex="\vec{F}" color={C.red} />
        {/* d = 0: مسطرة صفرية أسفل السيارة */}
        <Carrier from={[236, 224]} to={[236, 250]} />
        <Carrier from={[480, 224]} to={[480, 250]} />
        <line x1={236} y1={250} x2={480} y2={250} stroke={C.blue} strokeWidth={2.4} strokeDasharray="7 5" strokeLinecap="round" />
        <g stroke={C.blue} strokeWidth={2.6} strokeLinecap="round">
          <line x1={236} y1={244} x2={236} y2={256} />
          <line x1={480} y1={244} x2={480} y2={256} />
        </g>
        <Label at={[358, 274]} tex="d=0" color={C.blue} />
        <ArabicLabel at={[470, 46]} text="قوة مؤثرة — لا انتقال ظاهر" size={18} />
      </Plate>

      <Plate variant="narrow" viewBox="0 0 400 330" title="شخص يدفع سيارة متوقفة: توجد قوة ولا يظهر انتقال"
        desc="نسخة الهاتف: رجل يدفع سيارة ساكنة، القوة F إلى اليمين، والمسافة d تساوي صفراً، والعمل معدوم." maxWidth="24rem">
        <Ground x1={20} x2={380} y={236} />
        {/* السيارة: مقياس 0.78 وإزاحة تجعل العجلات على الأرض */}
        <g transform="translate(-42 66.7) scale(0.78)">
          <path d="M236 196 L236 176 Q236 168 244 166 L264 163 Q276 132 312 128 L372 128 Q406 131 424 161 L470 166 Q480 169 480 178 L480 196 Z"
            fill={C.body} stroke={C.bodyEdge} strokeWidth={3.4} strokeLinejoin="round" />
          <path d="M282 158 L308 136 L372 136 L372 158 Z" fill="#ffffff" stroke={C.bodyEdge} strokeWidth={2.4} strokeLinejoin="round" />
          <path d="M380 136 L402 136 Q416 138 424 158 L380 158 Z" fill="#ffffff" stroke={C.bodyEdge} strokeWidth={2.4} strokeLinejoin="round" />
          <circle cx={266} cy={196} r={21} fill="#28384c" />
          <circle cx={266} cy={196} r={8} fill="#dfe8ee" />
          <circle cx={446} cy={196} r={21} fill="#28384c" />
          <circle cx={446} cy={196} r={8} fill="#dfe8ee" />
        </g>
        <Pusher x={102} y={236} scale={0.8} />
        {/* القوة F فوق المشهد، وخط إسناد ينزل إلى نقطة التلامس على الصادم */}
        <PointMark at={[143, 176]} color={C.red} />
        <Carrier from={[143, 172]} to={[143, 126]} color={C.red} width={1.7} />
        <Vector from={[143, 118]} to={[258, 118]} color={C.red} width={S.forceNarrow} />
        <PointMark at={[143, 118]} color={C.red} />
        <Label at={[110, 118]} tex="\vec{F}" color={C.red} size={S.labelNarrow} width={40} />
        {/* d = 0: مسطرة صفرية أسفل السيارة بين المحورين */}
        <Carrier from={[166, 242]} to={[166, 286]} />
        <Carrier from={[306, 242]} to={[306, 286]} />
        <line x1={166} y1={286} x2={306} y2={286} stroke={C.blue} strokeWidth={2.4} strokeDasharray="7 5" strokeLinecap="round" />
        <g stroke={C.blue} strokeWidth={2.6} strokeLinecap="round">
          <line x1={166} y1={279} x2={166} y2={293} />
          <line x1={306} y1={279} x2={306} y2={293} />
        </g>
        <Label at={[236, 312]} tex="d=0" color={C.blue} size={S.labelNarrow} width={64} />
        <ArabicLabel at={[240, 36]} text="قوة مؤثرة — لا انتقال ظاهر" size={22} />
      </Plate>
    </>
  );
}

/* ═══════════════ 2) رفع صندوق / حمله أفقياً (ص 42) ═══════════════ */

export function WorkLiftCarryFigure() {
  /**
   * لوحتان متطابقتا المعنى في النسختين:
   *  - الرفع: الصندوق يُرفع رأسياً؛ الخُطى المنقّطة تُظهر موضعه الأول، و d هي
   *    المسافة بين الموضعين، و F إلى أعلى في توافق مع الانتقال ⇒ عمل موجب.
   *  - الحمل: الصندوق يُنقل أفقياً على الارتفاع نفسه (F إلى أعلى و d أفقي)،
   *    فالقوة عمودية على الانتقال ⇒ عمل معدوم.
   */
  const ghost = (x: number, y: number, w: number, h: number) => (
    <rect x={x} y={y} width={w} height={h} rx={5} fill="none"
      stroke={C.guide} strokeWidth={2} strokeDasharray="7 5" />
  );

  const lift = (
    <g>
      <Panel x={12} y={10} w={406} h={282} />
      <ArabicLabel at={[214, 46]} text="رفع الصندوق" size={19} />
      <Ground x1={44} x2={386} y={234} />
      {/* موضع البداية (منقّط) ثم الموضع بعد الرفع */}
      {ghost(170, 84, 82, 72)}
      <Crate x={170} y={162} w={82} h={72} id="lift" />
      {/* قوة الرفع F إلى أعلى، متصلة بالصندوق بخطّ إسناد */}
      <Vector from={[120, 220]} to={[120, 116]} color={C.green} width={S.force} />
      <Carrier from={[168, 198]} to={[128, 198]} />
      <Label at={[88, 168]} tex="\vec{F}" color={C.green} />
      {/* d رأسياً بين الموضعين */}
      <Carrier from={[252, 156]} to={[306, 156]} />
      <Carrier from={[252, 234]} to={[306, 234]} />
      <Vector from={[302, 234]} to={[302, 156]} color={C.blue} width={S.ref} />
      <Label at={[336, 196]} tex="d" color={C.blue} />
      <ArabicLabel at={[214, 272]} text="الاتجاهان متوافقان" color={C.green} size={17} />
    </g>
  );

  const carry = (
    <g>
      <Panel x={432} y={10} w={406} h={282} />
      <ArabicLabel at={[634, 46]} text="حمل الصندوق أفقياً" size={19} />
      <Ground x1={464} x2={806} y={262} />
      {/* الموضع الأول منقّط، والصندوق الحالي إلى يمينه على الارتفاع نفسه */}
      {ghost(604, 132, 82, 72)}
      <Crate x={722} y={132} w={82} h={72} id="carry" />
      <Vector from={[763, 128]} to={[763, 60]} color={C.green} width={S.force} />
      <Label at={[794, 96]} tex="\vec{F}" color={C.green} />
      {/* d أفقياً بين الموضعين */}
      <Carrier from={[604, 208]} to={[604, 236]} />
      <Carrier from={[722, 208]} to={[722, 236]} />
      <Vector from={[608, 232]} to={[718, 232]} color={C.blue} width={S.ref} />
      <Label at={[760, 232]} tex="d" color={C.blue} width={30} />
      {/* التفسير في المنطقة الحرة على يسار اللوحة */}
      <ArabicLabel at={[524, 150]} text="القوة عمودية" color={C.red} size={17} />
      <ArabicLabel at={[524, 174]} text="على الانتقال" color={C.red} size={17} />
      <ArabicLabel at={[524, 214]} text="العمل معدوم" color={C.gold} size={16} />
    </g>
  );

  /* نسخة الهاتف: اللوحتان فوق بعضهما بمساحات تنفّس كافية. */
  const narrowLift = (
    <g>
      <Panel x={8} y={8} w={384} h={240} />
      <ArabicLabel at={[200, 44]} text="رفع الصندوق" size={23} />
      <Ground x1={40} x2={360} y={210} />
      {ghost(150, 82, 68, 62)}
      <Crate x={150} y={148} w={68} h={62} id="nlift" />
      <Vector from={[108, 200]} to={[108, 118]} color={C.green} width={S.forceNarrow} />
      <Carrier from={[148, 180]} to={[116, 180]} />
      <Label at={[78, 152]} tex="\vec{F}" color={C.green} size={S.labelNarrow} />
      <Carrier from={[218, 144]} to={[262, 144]} />
      <Carrier from={[218, 210]} to={[262, 210]} />
      <Vector from={[258, 210]} to={[258, 144]} color={C.blue} width={S.ref} />
      <Label at={[288, 178]} tex="d" color={C.blue} size={S.labelNarrow} width={30} />
      <ArabicLabel at={[200, 236]} text="الاتجاهان متوافقان" color={C.green} size={23} />
    </g>
  );

  const narrowCarry = (
    <g>
      <Panel x={8} y={256} w={384} h={240} />
      <ArabicLabel at={[200, 292]} text="حمل الصندوق أفقياً" size={23} />
      <Ground x1={40} x2={360} y={480} />
      {ghost(128, 366, 64, 58)}
      <Crate x={232} y={366} w={64} h={58} id="ncarry" />
      <Vector from={[264, 362]} to={[264, 302]} color={C.green} width={S.forceNarrow} />
      <Label at={[234, 330]} tex="\vec{F}" color={C.green} size={S.labelNarrow} width={32} />
      <Carrier from={[128, 426]} to={[128, 456]} />
      <Carrier from={[232, 426]} to={[232, 456]} />
      <Vector from={[132, 452]} to={[228, 452]} color={C.blue} width={S.ref} />
      <Label at={[252, 452]} tex="d" color={C.blue} size={S.labelNarrow} width={30} />
      <ArabicLabel at={[94, 328]} text="القوة عمودية" color={C.red} size={24} anchor="middle" />
      <ArabicLabel at={[94, 354]} text="على الانتقال" color={C.red} size={24} anchor="middle" />
    </g>
  );

  return (
    <>
      <Plate variant="wide" viewBox="0 0 850 302" maxWidth="48rem"
        title="مقارنة رفع صندوق إلى أعلى بحمله أفقياً"
        desc="في الرفع يتجه الانتقال d إلى أعلى مع قوة الرفع F، والعمل موجب. في الحمل الأفقي تكون F إلى أعلى بينما d أفقي، فالقوة عمودية على الانتقال والعمل معدوم.">
        {lift}
        {carry}
      </Plate>
      <Plate variant="narrow" viewBox="0 0 400 506" maxWidth="24rem"
        title="مقارنة رفع صندوق إلى أعلى بحمله أفقياً"
        desc="نسخة الهاتف: الرفع (القوة والانتقال إلى أعلى) أعلى، والحمل الأفقي (القوة إلى أعلى والانتقال أفقي) أسفل.">
        {narrowLift}
        {narrowCarry}
      </Plate>
    </>
  );
}

/* ═══════════════ 3) الحالات الأربع للعمل (ص 44) ═══════════════ */

type CaseSpec = {
  title: string;
  force: "right" | "left" | "up";
  sign: string;
  signColor: string;
  moves: boolean;
};

const CASES: CaseSpec[] = [
  { title: "القوة موافقة للانتقال", force: "right", sign: "W>0", signColor: C.green, moves: true },
  { title: "القوة معاكسة للانتقال", force: "left", sign: "W<0", signColor: C.red, moves: true },
  { title: "القوة عمودية على الانتقال", force: "up", sign: "W=0", signColor: C.gold, moves: true },
  { title: "لا يحدث انتقال", force: "right", sign: "W=0", signColor: C.blue, moves: false },
];

/** لوحة حالة واحدة: العنوان، شارة الإشارة، الشكل، ثم شريط الانتقال — أربعة صفوف منفصلة. */
function CasePanel({ spec, x, y, w, h, compact = false }: {
  spec: CaseSpec; x: number; y: number; w: number; h: number; compact?: boolean;
}) {
  const L = compact
    ? { title: 34, badge: 74, cy: 154, boxW: 52, boxH: 42, arrow: 62, dRow: 186, vArrow: 36, lab: 22 }
    : { title: 36, badge: 66, cy: 160, boxW: 58, boxH: 46, arrow: 72, dRow: 205, vArrow: 44, lab: S.labelWide };
  const cx = x + w / 2;
  const cy = y + L.cy;
  const fColor = C.red;
  const boxTop = cy - L.boxH / 2;
  const boxBottom = cy + L.boxH / 2;
  const half = compact ? 46 : 56;

  return (
    <g>
      <Panel x={x} y={y} w={w} h={h} />
      <ArabicLabel at={[cx, y + L.title]} text={spec.title} size={compact ? 23 : 17} />
      {/* شارة إشارة العمل — صف مستقل أعلى اللوحة، لا يلمس أي سهم */}
      <rect x={cx - (compact ? 62 : 52)} y={y + L.badge - (compact ? 19 : 15)} width={compact ? 124 : 104} height={compact ? 38 : 30} rx={9}
        fill="#ffffff" stroke={spec.signColor} strokeWidth={1.6} />
      <Label at={[cx, y + L.badge]} tex={spec.sign} color={spec.signColor}
        size={compact ? 23 : 17} width={compact ? 124 : 104} height={compact ? 38 : 30} />

      {/* الصندوق */}
      <rect x={cx - L.boxW / 2} y={boxTop} width={L.boxW} height={L.boxH} rx={6}
        fill={C.wood} stroke={C.woodEdge} strokeWidth={2.6} />

      {/* سهم القوة: التسمية دائمًا خارج السهم وبعيدًا عن حدّ اللوحة */}
      {spec.force === "right" && <Vector from={[cx, cy]} to={[cx + L.arrow, cy]} color={fColor} width={compact ? S.forceNarrow : 5} />}
      {spec.force === "left" && <Vector from={[cx, cy]} to={[cx - L.arrow, cy]} color={fColor} width={compact ? S.forceNarrow : 5} />}
      {spec.force === "up" && <Vector from={[cx, boxTop + 2]} to={[cx, boxTop - L.vArrow]} color={fColor} width={compact ? S.forceNarrow : 5} />}

      {spec.force === "right" && <Label at={[cx + L.arrow + (compact ? 15 : 18), cy]} tex="\vec{F}" color={fColor} size={L.lab} width={38} />}
      {spec.force === "left" && <Label at={[cx - L.arrow - (compact ? 15 : 18), cy]} tex="\vec{F}" color={fColor} size={L.lab} width={38} />}
      {spec.force === "up" && (compact
        ? <Label at={[cx - 26, boxTop - L.vArrow * 0.55]} tex="\vec{F}" color={fColor} size={L.lab} width={38} />
        : <Label at={[cx + L.vArrow * 0.72, boxTop - L.vArrow * 0.82]} tex="\vec{F}" color={fColor} size={L.lab} width={38} />)}

      {/* شريط الانتقال — صف سفلي مستقل تمامًا عن الأسهم */}
      <g transform={`translate(0 ${y + L.dRow})`}>
        {spec.moves ? (
          <>
            <Vector from={[cx - half, 0]} to={[cx + half, 0]} color={C.blue} width={3.6} />
            <Label at={[cx + half + (compact ? 16 : 20), 0]} tex="d" color={C.blue} size={L.lab} width={30} />
          </>
        ) : (
          <>
            <line x1={cx - half} y1={0} x2={cx + half} y2={0} stroke={C.blue} strokeWidth={2.2} strokeDasharray="6 5" strokeLinecap="round" />
            <g stroke={C.blue} strokeWidth={2.4} strokeLinecap="round">
              <line x1={cx - half} y1={-7} x2={cx - half} y2={7} />
              <line x1={cx + half} y1={-7} x2={cx + half} y2={7} />
            </g>
            <Label at={[cx + half + (compact ? 36 : 34), 0]} tex="d=0" color={C.blue} size={compact ? 22 : 17} width={compact ? 66 : 52} />
          </>
        )}
      </g>
    </g>
  );
}

export function WorkDirectionCasesFigure() {
  return (
    <>
      <Plate variant="wide" viewBox="0 0 850 502" maxWidth="48rem"
        title="الحالات الأربع للعمل: موجب وسالب ومعدوم عند التعامد أو انعدام الانتقال"
        desc="أربع لوحات: قوة موافقة للانتقال (عمل موجب)، قوة معاكسة (عمل سالب)، قوة عمودية (عمل معدوم)، ولا انتقال (العمل معدوم لأن d تساوي صفراً).">
        {CASES.map((spec, i) => (
          <CasePanel key={spec.title} spec={spec}
            x={14 + (i % 2) * 424} y={14 + Math.floor(i / 2) * 237} w={404} h={223} />
        ))}
      </Plate>
      <Plate variant="narrow" viewBox="0 0 400 892" maxWidth="24rem"
        title="الحالات الأربع للعمل: موجب وسالب ومعدوم عند التعامد أو انعدام الانتقال"
        desc="نسخة الهاتف: الحالات الأربع مرتّبة عمودياً بعناوين ورموز أكبر.">
        {CASES.map((spec, i) => (
          <CasePanel key={spec.title} spec={spec} compact x={8} y={8 + i * 221} w={384} h={213} />
        ))}
      </Plate>
    </>
  );
}

/* ═══════════════ 4) القوى المؤثرة في سيارة (ص 45) ═══════════════ */

/** سيارة جانبية تواجه اليمين: مقدمة منحدرة عند اليمين، صندوق خلفي عند اليسار. */
function CarBody() {
  return (
    <g>
      {/* الهيكل */}
      <path
        d="M8 168 L8 148 Q8 140 18 138 L74 132 Q96 90 140 86 L214 86 Q258 90 280 130 L340 136 Q352 139 352 150 L352 168 Z"
        fill={C.body} stroke={C.bodyEdge} strokeWidth={3} strokeLinejoin="round"
      />
      {/* زجاج أمامي (يمين) وزجاج خلفي (يسار) */}
      <path d="M150 124 L184 92 L268 92 L286 124 Z" fill="#ffffff" stroke={C.bodyEdge} strokeWidth={2} strokeLinejoin="round" />
      <path d="M142 124 L142 92 L116 94 Q102 100 94 124 Z" fill="#ffffff" stroke={C.bodyEdge} strokeWidth={2} strokeLinejoin="round" />
      {/* العجلات */}
      <circle cx={78} cy={168} r={21} fill="#28384c" />
      <circle cx={78} cy={168} r={8} fill="#dfe8ee" />
      <circle cx={282} cy={168} r={21} fill="#28384c" />
      <circle cx={282} cy={168} r={8} fill="#dfe8ee" />
    </g>
  );
}

export function WorkCarForcesFigure() {
  /**
   * مخطط جسم حرّ مبسّط: كل سهم ينطلق من حدّ الهيكل نفسه في نقطة تأثيره
   * (الصادم الأمامي والخلفي، أعلى السقف، أسفل البدن)، بلا خطوط إسناد تعبر
   * الزجاج. الهيكل المحلي: العرض 8..352، السقف y=86، أسفل البدن y=168،
   * والعجلات تلامس الطريق عند y=189 بعد الإزاحة والتحجيم.
   */
  return (
    <>
      <Plate variant="wide" viewBox="0 0 760 400" maxWidth="44rem"
        title="القوى المؤثرة في سيارة تتحرك أفقياً إلى اليمين"
        desc="سيارة تتحرك إلى اليمين: قوة F₁ إلى اليمين (عمل موجب)، قوة F₂ إلى اليسار (عمل سالب)، وقوة رد الفعل R إلى أعلى والوزن W إلى أسفل؛ وكلتاهما عموديتان على اتجاه الانتقال، فعمل كل منهما معدوم.">
        <g transform="translate(158 16)">
          <CarBody />
        </g>
        {/* الطريق: انقطاع عند سهم الوزن ليمرّ دون تقاطع */}
        <line x1={40} y1={205} x2={326} y2={205} stroke={C.rule} strokeWidth={3} strokeLinecap="round" />
        <line x1={350} y1={205} x2={720} y2={205} stroke={C.rule} strokeWidth={3} strokeLinecap="round" />

        {/* F₁: من الصادم الأمامي إلى اليمين */}
        <PointMark at={[510, 152]} color={C.gold} />
        <Vector from={[510, 152]} to={[636, 152]} color={C.gold} width={S.force} />
        <Label at={[573, 122]} tex="F_1" color={C.gold} />
        {/* F₂: من الصادم الخلفي إلى اليسار */}
        <PointMark at={[166, 152]} color={C.red} />
        <Vector from={[166, 152]} to={[40, 152]} color={C.red} width={S.force} />
        <Label at={[103, 122]} tex="F_2" color={C.red} />
        {/* R: من أعلى السقف إلى أعلى */}
        <PointMark at={[338, 102]} color={C.green} />
        <Vector from={[338, 102]} to={[338, 34]} color={C.green} width={S.force} />
        <Label at={[378, 62]} tex="R" color={C.green} />
        {/* W: من أسفل البدن إلى أسفل داخل فجوة الطريق */}
        <PointMark at={[338, 184]} color={C.violet} />
        <Vector from={[338, 184]} to={[338, 284]} color={C.violet} width={S.force} />
        <Label at={[378, 252]} tex="W" color={C.violet} />

        {/* d: صف مستقل أسفل الطريق، خطّاه عند نقطتي تماسّ العجلتين */}
        <Carrier from={[236, 210]} to={[236, 330]} />
        <Carrier from={[440, 210]} to={[440, 330]} />
        <Vector from={[238, 330]} to={[438, 330]} color={C.blue} width={S.ref} />
        <Label at={[338, 358]} tex="d" color={C.blue} />
        <ArabicLabel at={[380, 390]} text="اتجاه الانتقال إلى اليمين" size={17} />
      </Plate>

      <Plate variant="narrow" viewBox="0 0 400 452" maxWidth="24rem"
        title="القوى المؤثرة في سيارة تتحرك أفقياً إلى اليمين"
        desc="نسخة الهاتف: القوى الأربع حول السيارة بتسميات أكبر، مع اتجاه الانتقال إلى اليمين.">
        {/* سيارة مُصغّرة 0.7 ومُرَكَّزة، لتتّسع الأسهم الأربعة بتسمياتها */}
        <g transform="translate(60.4 107.7) scale(0.7)">
          <CarBody />
        </g>
        <line x1={8} y1={240} x2={176} y2={240} stroke={C.rule} strokeWidth={3.4} strokeLinecap="round" />
        <line x1={196} y1={240} x2={392} y2={240} stroke={C.rule} strokeWidth={3.4} strokeLinecap="round" />

        <PointMark at={[306.8, 214.1]} color={C.gold} />
        <Vector from={[306.8, 214.1]} to={[370, 214.1]} color={C.gold} width={S.forceNarrow} />
        <Label at={[338, 182]} tex="F_1" color={C.gold} size={S.labelNarrow} />

        <PointMark at={[66, 214.1]} color={C.red} />
        <Vector from={[66, 214.1]} to={[6, 214.1]} color={C.red} width={S.forceNarrow} />
        <Label at={[36, 182]} tex="F_2" color={C.red} size={S.labelNarrow} />

        <PointMark at={[186, 167.9]} color={C.green} />
        <Vector from={[186, 167.9]} to={[186, 100]} color={C.green} width={S.forceNarrow} />
        <Label at={[216, 128]} tex="R" color={C.green} size={S.labelNarrow} />

        <PointMark at={[186, 225.3]} color={C.violet} />
        <Vector from={[186, 225.3]} to={[186, 322]} color={C.violet} width={S.forceNarrow} />
        <Label at={[216, 298]} tex="W" color={C.violet} size={S.labelNarrow} />

        <Carrier from={[115, 246]} to={[115, 356]} />
        <Carrier from={[258, 246]} to={[258, 356]} />
        <Vector from={[117, 356]} to={[256, 356]} color={C.blue} width={S.ref} />
        <Label at={[186, 382]} tex="d" color={C.blue} size={S.labelNarrow} />
        <ArabicLabel at={[200, 430]} text="اتجاه الانتقال إلى اليمين" size={23} />
      </Plate>
    </>
  );
}

/**
 * حصان جانبي (رسم توضيحي علمي مسطّح) على شبكة محلية صريحة، صورة ظلّية واحدة
 * متّصلة بلا خطوط داخلية:
 *   الأرض y=0 · الغارب y=-100 · الظهر y=-102 · البطن y=-44
 *   الصدر x=40 · الحوض x=-70 · الخطم x=122 · أعلى الأذن y=-206
 * الرأس مرتفع كي يمرّ حبل الجرّ عند ارتفاع الطوق (y≈-100) أسفل الرقبة.
 */
function Horse({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  const coat = "#a9743f";
  const shade = "#8a5a30";
  const far = "#bd8555";
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} strokeLinejoin="round" strokeLinecap="round">
      {/* الأرجل البعيدة */}
      <g stroke={far} strokeWidth={8} fill="none">
        <path d="M36 -50 L32 -26 L34 -6" />
        <path d="M-34 -54 L-42 -30 L-38 -6" />
      </g>
      {/* الذيل */}
      <path d="M-56 -106 C-80 -104 -94 -82 -92 -36 C-88 -18 -82 -12 -78 -10
        C-80 -44 -74 -70 -58 -84 C-64 -92 -62 -100 -56 -106 Z"
        fill="#5a3a22" stroke="#4a2f1c" strokeWidth={1.4} />
      {/* الأرجل القريبة */}
      <g stroke={shade} strokeWidth={9} fill="none">
        <path d="M24 -50 L20 -26 L22 -6" />
        <path d="M-46 -52 L-54 -30 L-50 -6" />
      </g>
      {/* الصورة الظلّية: الخطم ← الوجه ← القفا ← حدبة العنق ← الغارب ← الظهر ←
          القَطاة ← الفخذ ← البطن ← الصدر ← الحلق ← الفكّ ← الشفة ← الخطم */}
      <path
        d="M122 -162
           L129 -152
           L117 -145
           L101 -143
           L86 -148
           L68 -140
           L54 -120
           L46 -100
           L38 -76
           Q32 -48 24 -44
           L-14 -42
           Q-40 -41 -50 -46
           L-56 -60
           L-62 -76
           Q-70 -90 -70 -100
           Q-64 -108 -52 -106
           L-20 -104
           L16 -102
           L30 -100
           L46 -126
           L58 -152
           L68 -172
           L74 -176
           L82 -178
           L92 -182
           L104 -176
           L114 -170
           Z"
        fill={coat} stroke={shade} strokeWidth={2}
      />
      {/* اللبدة على حدبة العنق */}
      <path d="M30 -100 L46 -126 L58 -152 L68 -172 L74 -176 L78 -178 L72 -168 L62 -148 L52 -122 L38 -98 Z" fill="#5a3a22" />
      {/* الأذنان */}
      <path d="M76 -176 L80 -206 L90 -178 Z" fill={coat} stroke={shade} strokeWidth={1.6} />
      <path d="M90 -178 L96 -196 L102 -176 Z" fill={far} stroke={shade} strokeWidth={1.3} />
      {/* العين والمنخر والفم */}
      <circle cx={96} cy={-170} r={2.4} fill="#241a12" />
      <circle cx={118} cy={-152} r={1.7} fill="#241a12" />
      <path d="M121 -147 Q113 -144 104 -145" fill="none" stroke="#4a2f1c" strokeWidth={1.4} strokeLinecap="round" />
      {/* الحوافر */}
      <g fill="#3b2a1c">
        <rect x={12} y={-7} width={17} height={7} rx={2} />
        <rect x={-50} y={-7} width={17} height={7} rx={2} />
        <rect x={26} y={-7} width={15} height={7} rx={2} opacity={0.8} />
        <rect x={-48} y={-7} width={15} height={7} rx={2} opacity={0.8} />
      </g>
      {/* الطوق عند قاعدة العنق: نقطة ارتباط حبل الجرّ */}
      <path d="M16 -100 L40 -78" stroke="#4a3524" strokeWidth={7} strokeLinecap="round" />
    </g>
  );
}

export function WorkHorsepowerFigure() {
  /**
   * مشهد «الحصان البخاري»: حصان يشدّ حبلًا أفقيًا عند ارتفاع الطوق، يمرّ الحبل
   * على بكرة مثبّتة أعلى عمود، ثم ينزل إلى ثقل معلّق. موضع الثقل الأول مرسوم
   * بخطّ منقّط، والرمز d هو المسافة التي ارتفعها الثقل بين الموضعين.
   */
  const scene = (o: {
    ground: number; horseX: number; horseK: number; wheelX: number; wheelY: number; wheelR: number;
    crateW: number; crateH: number; gap: number; label: number; capW: number;
  }) => {
    const { ground, horseX, horseK, wheelX, wheelY, wheelR, crateW, crateH, gap, label, capW } = o;
    const rim = wheelX + wheelR;
    const ropeX = rim + 2;
    const crateX = ropeX - crateW / 2;
    const crateY = wheelY + wheelR + gap;
    const ghostY = ground - crateH;
    /* الحبل ينطلق من الطوق عند قاعدة العنق (أعلى الكتف) ويرتفع قليلًا إلى
       مجرى البكرة على عمود مرتفع، فلا يقطع الرأس ولا الجسم. */
    /* نقطة الجرّ: مقدّمة الكتف عند أسفل الطوق، فيمرّ الحبل أسفل الحلق
       (خارج صورة الحصان) نحو البكرة. */
    const collarY = ground - 78 * horseK;
    const collarX = horseX + 40 * horseK;
    return (
      <>
        <Ground x1={8} x2={capW - 8} y={ground} />
        <Horse x={horseX} y={ground} scale={horseK} />

        {/* العمود والقاعدة */}
        <rect x={wheelX - 7} y={wheelY} width={14} height={ground - wheelY} fill={C.steel} rx={3} />
        <rect x={wheelX - 11} y={ground - 8} width={22} height={8} rx={3} fill={C.steel} />

        {/* الحبل من الطوق إلى مجرى البكرة (أفقي عند ارتفاع المحور) */}
        <Vector from={[collarX, collarY]} to={[wheelX - wheelR + 3, wheelY]} color={C.rope} width={4.2} />
        <Label
          at={[(collarX + wheelX - wheelR) / 2 - 6 * horseK, (collarY + wheelY) / 2 - 24]}
          tex="\vec{F}" color="#6b5230" size={label} />

        {/* البكرة: إطار + مجرى + محور + أذرع + سهم دوران عكس عقارب الساعة */}
        <g>
          <circle cx={wheelX} cy={wheelY} r={wheelR} fill="#ffffff" stroke={C.steel} strokeWidth={4.4} />
          <circle cx={wheelX} cy={wheelY} r={wheelR * 0.78} fill="none" stroke={C.steel} strokeWidth={1.6} opacity={0.5} />
          <circle cx={wheelX} cy={wheelY} r={4.5} fill={C.steel} />
          {[0, 60, 120].map((deg) => {
            const a = (deg * Math.PI) / 180;
            return (
              <line key={deg}
                x1={wheelX + Math.cos(a) * wheelR * 0.76} y1={wheelY + Math.sin(a) * wheelR * 0.76}
                x2={wheelX + Math.cos(a + Math.PI) * wheelR * 0.76} y2={wheelY + Math.sin(a + Math.PI) * wheelR * 0.76}
                stroke={C.steel} strokeWidth={2.1} strokeLinecap="round" />
            );
          })}
          <path d={`M${wheelX - wheelR * 0.55} ${wheelY - wheelR * 0.52} a ${wheelR * 0.78} ${wheelR * 0.78} 0 0 1 ${wheelR * 0.95} ${-wheelR * 0.2}`}
            fill="none" stroke={C.steel} strokeWidth={2.3} strokeLinecap="round" />
          <path d={`M${wheelX + wheelR * 0.34} ${wheelY - wheelR * 0.74} l${wheelR * 0.12} ${wheelR * 0.26} l${-wheelR * 0.26} ${-wheelR * 0.05} z`} fill={C.steel} />
        </g>

        {/* الحبل الهابط عموديًا من مجرى البكرة إلى الثقل */}
        <line x1={crateX + crateW / 2} y1={wheelY} x2={crateX + crateW / 2} y2={crateY} stroke={C.rope} strokeWidth={4} strokeLinecap="round" />

        {/* موضع البداية (منقّط) ثم الموضع الحالي */}
        <rect x={crateX} y={ghostY} width={crateW} height={crateH} rx={5}
          fill="none" stroke={C.guide} strokeWidth={2} strokeDasharray="7 5" />
        <Crate x={crateX} y={crateY} w={crateW} h={crateH} id="weight" />

        {/* d: المسافة بين الموضعين، بعلامتي حدّ أفقيّتين وسهم رأسي */}
        <Carrier from={[crateX + crateW, crateY + crateH]} to={[capW - 62, crateY + crateH]} />
        <g stroke={C.blue} strokeWidth={2.2} strokeLinecap="round">
          <line x1={capW - 66} y1={crateY + crateH} x2={capW - 54} y2={crateY + crateH} />
          <line x1={capW - 66} y1={ghostY + crateH} x2={capW - 54} y2={ghostY + crateH} />
        </g>
        <Vector from={[capW - 42, ghostY + crateH]} to={[capW - 42, crateY + crateH]} color={C.blue} width={4} />
        <Label at={[capW - 16, (crateY + ghostY + crateH) / 2]} tex="d" color={C.blue} size={label} width={26} />
      </>
    );
  };

  return (
    <>
      <Plate variant="wide" viewBox="0 0 800 340" maxWidth="44rem"
        title="الحصان البخاري: وحدة للاستطاعة"
        desc="حصان يشدّ حبلًا يمرّ على بكرة مثبّتة على عمود فيرفع ثقلًا. القوة F في الحبل، والثقل يرتفع المسافة d؛ والعمل يساوي القوة في المسافة، والاستطاعة هي العمل في وحدة الزمن.">
        {scene({ ground: 300, horseX: 104, horseK: 0.98, wheelX: 586, wheelY: 96, wheelR: 34,
          crateW: 48, crateH: 46, gap: 58, label: S.labelWide, capW: 792 })}
        <ArabicLabel at={[330, 330]} text="الحصان البخاري — وحدة للاستطاعة" size={17} />
      </Plate>
      <Plate variant="narrow" viewBox="0 0 400 252" maxWidth="24rem"
        title="الحصان البخاري: وحدة للاستطاعة"
        desc="نسخة الهاتف: حصان يشدّ حبلًا يمرّ على بكرة فيرفع ثقلًا مسافة d.">
        {scene({ ground: 204, horseX: 64, horseK: 0.5, wheelX: 276, wheelY: 62, wheelR: 24,
          crateW: 32, crateH: 30, gap: 46, label: S.labelNarrow, capW: 396 })}
        <ArabicLabel at={[188, 246]} text="الحصان البخاري — وحدة للاستطاعة" size={23} />
      </Plate>
    </>
  );
}
