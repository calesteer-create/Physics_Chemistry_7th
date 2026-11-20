import { SvgTeX } from "@/components/math/TeX";

const blue = "#2874a6";
const red = "#c2415d";
const gold = "#d28a00";
const green = "#23835d";
const ink = "#26374a";

function DiagramFrame({ title, viewBox, children, maxWidth = "44rem" }: { title: string; viewBox: string; children: React.ReactNode; maxWidth?: string }) {
  return (
    <svg viewBox={viewBox} className="h-auto w-full" style={{ maxWidth }} role="img" aria-label={title}>
      <title>{title}</title>
      {children}
    </svg>
  );
}

function Arrow({ x1, y1, x2, y2, color, width = 5 }: { x1: number; y1: number; x2: number; y2: number; color: string; width?: number }) {
  const horizontal = Math.abs(y2 - y1) < Math.abs(x2 - x1);
  const forward = horizontal ? x2 >= x1 : y2 <= y1;
  const points = horizontal
    ? (forward ? `${x2},${y2} ${x2 - 13},${y2 - 8} ${x2 - 13},${y2 + 8}` : `${x2},${y2} ${x2 + 13},${y2 - 8} ${x2 + 13},${y2 + 8}`)
    : (forward ? `${x2},${y2} ${x2 - 8},${y2 + 13} ${x2 + 8},${y2 + 13}` : `${x2},${y2} ${x2 - 8},${y2 - 13} ${x2 + 8},${y2 - 13}`);
  return <g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" /><polygon points={points} fill={color} /></g>;
}

export function WorkStoppedCarFigure() {
  return (
    <DiagramFrame title="شخص يدفع سيارة متوقفة: توجد قوة ولا يظهر انتقال" viewBox="0 0 620 270" maxWidth="38rem">
      <path d="M32 224H588" stroke="#91a4b3" strokeWidth="3" />
      <path d="M382 181q7-45 35-52h100q30 7 47 52l22 11v27H370v-24z" fill="#dce8ef" stroke="#456277" strokeWidth="3" />
      <path d="M425 135h86q19 7 30 40H405z" fill="#fff" stroke="#7892a5" strokeWidth="2" />
      <circle cx="420" cy="218" r="22" fill="#26374a" /><circle cx="420" cy="218" r="10" fill="#d6e1e8" />
      <circle cx="544" cy="218" r="22" fill="#26374a" /><circle cx="544" cy="218" r="10" fill="#d6e1e8" />
      <circle cx="142" cy="128" r="17" fill="#d8a27c" stroke={ink} strokeWidth="2" />
      <path d="M133 114q2-20 21-16l10 13-9 1-9-6-7 12" fill="#465c70" />
      <path d="M140 147l42 23 29 3" fill="none" stroke="#355f86" strokeWidth="13" strokeLinecap="round" />
      <path d="M181 169l39 22 75-3" fill="none" stroke="#355f86" strokeWidth="11" strokeLinecap="round" />
      <path d="M175 169l-33 42-54 4 M212 190l-4 26-39 7" fill="none" stroke="#26374a" strokeWidth="12" strokeLinecap="round" />
      <Arrow x1={294} y1={166} x2={369} y2={166} color={red} />
      <SvgTeX tex="F" x={317} y={132} width={24} height={24} color={red} fontSize="18px" />
      <line x1="360" y1="179" x2="360" y2="210" stroke={red} strokeWidth="4" />
      <line x1="347" y1="210" x2="373" y2="210" stroke={red} strokeWidth="4" />
      <SvgTeX tex="d=0" x={315} y={222} width={70} height={24} color={ink} fontSize="16px" />
      <text x="505" y="47" textAnchor="middle" direction="rtl" fill={ink} fontSize="18" fontWeight="700">قوة مؤثرة — لا انتقال ظاهر</text>
    </DiagramFrame>
  );
}

export function WorkLiftCarryFigure() {
  return (
    <DiagramFrame title="مقارنة رفع صندوق إلى أعلى بحمله أفقياً" viewBox="0 0 720 270" maxWidth="48rem">
      <rect x="12" y="15" width="338" height="238" rx="18" fill="#f5f9fc" stroke="#c6d5df" strokeWidth="2" />
      <rect x="370" y="15" width="338" height="238" rx="18" fill="#f5f9fc" stroke="#c6d5df" strokeWidth="2" />
      <text x="180" y="48" textAnchor="middle" direction="rtl" fill={ink} fontSize="19" fontWeight="700">رفع الصندوق</text>
      <text x="540" y="48" textAnchor="middle" direction="rtl" fill={ink} fontSize="19" fontWeight="700">حمل الصندوق أفقياً</text>
      <line x1="56" y1="210" x2="302" y2="210" stroke="#718596" strokeWidth="3" />
      <rect x="158" y="130" width="74" height="64" rx="6" fill="#d9bd8e" stroke="#856f4c" strokeWidth="3" />
      <Arrow x1={195} y1={145} x2={195} y2={75} color={green} />
      <Arrow x1={245} y1={194} x2={245} y2={116} color={blue} />
      <SvgTeX tex="F" x={164} y={82} width={24} height={22} color={green} fontSize="17px" />
      <SvgTeX tex="d" x={248} y={143} width={22} height={22} color={blue} fontSize="17px" />
      <text x="194" y="235" textAnchor="middle" direction="rtl" fill={green} fontSize="15" fontWeight="700">الاتجاهان متوافقان</text>
      <line x1="412" y1="210" x2="663" y2="210" stroke="#718596" strokeWidth="3" />
      <rect x="500" y="130" width="74" height="64" rx="6" fill="#d9bd8e" stroke="#856f4c" strokeWidth="3" />
      <Arrow x1={537} y1={145} x2={537} y2={75} color={green} />
      <Arrow x1={525} y1={222} x2={638} y2={222} color={blue} />
      <SvgTeX tex="F" x={506} y={82} width={24} height={22} color={green} fontSize="17px" />
      <SvgTeX tex="d" x={602} y={224} width={22} height={22} color={blue} fontSize="17px" />
      <text x="539" y="252" textAnchor="middle" direction="rtl" fill={red} fontSize="14" fontWeight="700">القوة عمودية على الانتقال</text>
    </DiagramFrame>
  );
}

export function WorkDirectionCasesFigure() {
  const panels = [
    { x: 10, y: 10, title: "القوة موافقة للانتقال", sign: "W>0", f: "right", d: "right", moved: true, color: green },
    { x: 365, y: 10, title: "القوة معاكسة للانتقال", sign: "W<0", f: "left", d: "right", moved: true, color: red },
    { x: 10, y: 207, title: "القوة عمودية على الانتقال", sign: "W=0", f: "up", d: "right", moved: true, color: gold },
    { x: 365, y: 207, title: "لا يحدث انتقال", sign: "d=0, W=0", f: "right", d: "none", moved: false, color: blue },
  ] as const;
  return (
    <DiagramFrame title="الحالات الأربع للعمل: موجب وسالب ومعدوم عند التعامد أو انعدام الانتقال" viewBox="0 0 720 395" maxWidth="48rem">
      {panels.map((p) => {
        const cx = p.x + 170;
        const cy = p.y + 112;
        return (
          <g key={p.title}>
            <rect x={p.x} y={p.y} width="345" height="178" rx="15" fill="#f7fafc" stroke="#c6d5df" strokeWidth="2" />
            <text x={p.x + 172} y={p.y + 30} textAnchor="middle" direction="rtl" fill={ink} fontSize="16" fontWeight="700">{p.title}</text>
            <rect x={cx - 25} y={cy - 19} width="50" height="38" rx="5" fill="#dfc79d" stroke="#856f4c" strokeWidth="2" />
            {p.f === "right" && <Arrow x1={cx} y1={cy - 3} x2={cx + 68} y2={cy - 3} color={red} width={4} />}
            {p.f === "left" && <Arrow x1={cx} y1={cy - 3} x2={cx - 68} y2={cy - 3} color={red} width={4} />}
            {p.f === "up" && <Arrow x1={cx} y1={cy - 8} x2={cx} y2={cy - 65} color={red} width={4} />}
            {p.d === "right" && <Arrow x1={cx - 15} y1={cy + 41} x2={cx + 85} y2={cy + 41} color={blue} width={4} />}
            {p.d === "none" && <line x1={cx - 45} y1={cy + 42} x2={cx + 45} y2={cy + 42} stroke={blue} strokeWidth="3" strokeDasharray="6 5" />}
            <SvgTeX tex="F" x={p.f === "left" ? cx - 77 : cx + 43} y={p.f === "up" ? cy - 72 : cy - 30} width={22} height={22} color={red} fontSize="15px" />
            {p.d !== "none" && <SvgTeX tex="d" x={cx + 48} y={cy + 43} width={20} height={20} color={blue} fontSize="15px" />}
            <SvgTeX tex={p.sign} x={p.x + 122} y={p.y + 143} width={110} height={22} color={p.color} fontSize="16px" />
            {p.moved && <path d={`M${cx + 22} ${cy + 18}h20`} stroke="#8395a4" strokeWidth="2" strokeDasharray="4 4" />}
          </g>
        );
      })}
    </DiagramFrame>
  );
}

export function WorkCarForcesFigure() {
  return (
    <DiagramFrame title="القوى المؤثرة في سيارة تتحرك أفقياً إلى اليمين" viewBox="0 0 650 300" maxWidth="42rem">
      <line x1="70" y1="230" x2="575" y2="230" stroke="#96a6b1" strokeWidth="3" />
      <path d="M183 170q8-44 40-53h142q39 8 61 53l30 13v35H165v-29z" fill="#d8e7ef" stroke="#456277" strokeWidth="3" />
      <path d="M234 121h119q29 9 43 42H208z" fill="#fff" stroke="#7892a5" strokeWidth="2" />
      <circle cx="231" cy="218" r="23" fill="#26374a" /><circle cx="231" cy="218" r="10" fill="#d6e1e8" />
      <circle cx="407" cy="218" r="23" fill="#26374a" /><circle cx="407" cy="218" r="10" fill="#d6e1e8" />
      <Arrow x1={298} y1={168} x2={420} y2={168} color={gold} />
      <SvgTeX tex="F_1" x={340} y={132} width={36} height={22} color={gold} fontSize="17px" />
      <Arrow x1={298} y1={190} x2={186} y2={190} color={red} />
      <SvgTeX tex="F_2" x={208} y={160} width={36} height={22} color={red} fontSize="17px" />
      <Arrow x1={298} y1={147} x2={298} y2={62} color={green} />
      <SvgTeX tex="R" x={307} y={75} width={30} height={22} color={green} fontSize="18px" />
      <Arrow x1={345} y1={147} x2={345} y2={229} color={blue} />
      <SvgTeX tex="W" x={351} y={204} width={30} height={22} color={blue} fontSize="18px" />
      <SvgTeX tex="d" x={510} y={238} width={24} height={22} color={blue} fontSize="17px" />
      <Arrow x1={455} y1={246} x2={555} y2={246} color={blue} width={3} />
      <text x="324" y="286" textAnchor="middle" direction="rtl" fill={ink} fontSize="15" fontWeight="700">اتجاه الانتقال إلى اليمين</text>
    </DiagramFrame>
  );
}

export function WorkHorsepowerFigure() {
  return (
    <DiagramFrame title="رسم تفسيري لحصان يدير بكرة لرفع ثقل" viewBox="0 0 620 300" maxWidth="40rem">
      <line x1="48" y1="250" x2="570" y2="250" stroke="#6b7f8c" strokeWidth="3" />
      <path d="M118 205q10-38 48-48l46 8 27 26-13 30H137z" fill="#a75a32" stroke="#633b2b" strokeWidth="3" />
      <path d="M154 162l-3-34 26-13 20 18-9 31z" fill="#a75a32" stroke="#633b2b" strokeWidth="3" />
      <path d="M151 129l-14-22 23 9 16-16 1 24" fill="#633b2b" stroke="#633b2b" strokeWidth="2" />
      <circle cx="174" cy="136" r="3" fill="#17212b" />
      <path d="M157 207l-8 37 M190 210l12 34 M223 204l22 34 M135 207l-22 28" stroke="#633b2b" strokeWidth="9" strokeLinecap="round" />
      <path d="M220 173Q302 115 385 105" fill="none" stroke="#735b42" strokeWidth="4" />
      <circle cx="420" cy="83" r="46" fill="#f5f8fa" stroke="#566c7b" strokeWidth="5" />
      <circle cx="420" cy="83" r="7" fill="#566c7b" />
      {[0,45,90,135].map((deg) => <line key={deg} x1="420" y1="83" x2={420 + 39 * Math.cos(deg * Math.PI / 180)} y2={83 + 39 * Math.sin(deg * Math.PI / 180)} stroke="#718796" strokeWidth="3" />)}
      <path d="M385 105h70" stroke="#735b42" strokeWidth="4" />
      <line x1="455" y1="83" x2="455" y2="193" stroke="#735b42" strokeWidth="4" />
      <rect x="425" y="193" width="60" height="51" rx="4" fill="#a76a45" stroke="#69442f" strokeWidth="3" />
      <Arrow x1={508} y1={230} x2={508} y2={185} color={blue} />
      <SvgTeX tex="d" x={515} y={195} width={22} height={20} color={blue} fontSize="16px" />
      <text x="205" y="282" textAnchor="middle" direction="rtl" fill={ink} fontSize="16" fontWeight="700">الحصان البخاري — وحدة للاستطاعة</text>
    </DiagramFrame>
  );
}
