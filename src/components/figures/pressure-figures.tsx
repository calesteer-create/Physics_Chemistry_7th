"use client";

/**
 * الرسوم التسع لدرس «الضغط» (الوحدة الثانية — الدرس الأول، كتاب ص 65–70).
 * كل رسم يعتمد النظام الموحّد في `pressure-drawing.tsx` ويعرض نسختين:
 * واسعة للكمبيوتر وهاتف. لا رسم هنا مؤقت أو زخرفي: كل لوحة تحمل عناصر
 * الأصل وتسمياته وأسهمه، وتُفحص بصريًا قبل الاعتماد.
 */
import {
  C, S, Plate, Vector, PointMark, Carrier, Ground, Label, ArabicLabel, Panel, DippedSurface, MetalBlock, Sponge, Measure,
} from "./pressure-drawing";

/* ═══════════════ مكوّنات مشهد صغيرة مشتركة ═══════════════ */

/** جمل مبسّط واقف: القدمان على خط الأرض المحلي y=0، والجسم فوقه. */
function Camel({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} strokeLinecap="round" strokeLinejoin="round">
      {/* الأرجل والخفاف الواسعة */}
      {[30, 54, 106, 128].map((lx) => (
        <g key={lx}>
          <line x1={lx} y1={-54} x2={lx} y2={-4} stroke={C.bodyEdge} strokeWidth={8} />
          <rect x={lx - 14} y={-6} width={28} height={7} rx={3.5} fill="#cfe3f2" stroke={C.blue} strokeWidth={2} />
        </g>
      ))}
      {/* الرقبة والرأس */}
      <path d="M26 -84 L8 -112" stroke={C.bodyEdge} strokeWidth={13} fill="none" />
      <ellipse cx={0} cy={-117} rx={14} ry={8.5} fill={C.body} stroke={C.bodyEdge} strokeWidth={2.4} transform="rotate(-18 0 -117)" />
      {/* السنام والجسم */}
      <path d="M58 -94 Q80 -122 104 -94 Z" fill={C.body} stroke={C.bodyEdge} strokeWidth={2.4} />
      <path d="M16 -62 Q14 -96 50 -100 L114 -100 Q142 -96 140 -66 Q138 -48 110 -46 L46 -46 Q20 -46 16 -62 Z" fill={C.body} stroke={C.bodyEdge} strokeWidth={2.6} />
      <path d="M140 -88 L150 -58" stroke={C.bodyEdge} strokeWidth={5} fill="none" />
    </g>
  );
}

/** ساق حصان مكبّرة بحافر صغير صلب. */
function HorseLeg({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} strokeLinejoin="round">
      <path d="M-16 -120 L-10 -18 L-13 0 L13 0 L10 -18 L14 -120 Z" fill={C.body} stroke={C.bodyEdge} strokeWidth={2.6} />
      <path d="M-15 -14 L15 -14 L19 2 L-19 2 Z" fill="#5a4632" stroke="#3c2d1e" strokeWidth={2.2} />
      <line x1={-11} y1={-72} x2={11} y2={-72} stroke={C.bodyEdge} strokeWidth={2} strokeDasharray="5 4" />
    </g>
  );
}

/** متزلج على زلاجة عريضة: القدمان على خط الأرض المحلي y=0. */
function Skier({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} strokeLinecap="round" strokeLinejoin="round">
      <rect x={-78} y={-7} width={156} height={7} rx={3.5} fill="#cfe3f2" stroke={C.blue} strokeWidth={2.2} />
      <path d="M-14 -6 L-10 -44 L16 -44 L22 -6" stroke={C.bodyEdge} strokeWidth={9} fill="none" />
      <path d="M2 -44 L6 -84" stroke={C.violet} strokeWidth={15} fill="none" />
      <circle cx={9} cy={-97} r={11} fill="#e0b48f" stroke={C.bodyEdge} strokeWidth={2.2} />
      <path d="M4 -78 L-30 -58 L-44 -18" stroke={C.bodyEdge} strokeWidth={7} fill="none" />
      <path d="M10 -78 L36 -62 L52 -22" stroke={C.bodyEdge} strokeWidth={7} fill="none" />
    </g>
  );
}

/* ═══════════════ 1) الجمل والحافر والمتزلج (ص 65) ═══════════════ */

export function PressureCamelSkierFigure() {
  const wide = (
    <>
      <Panel x={12} y={10} w={216} h={304} />
      <ArabicLabel at={[120, 42]} text="الجمل على الرمل" size={18} />
      <DippedSurface x1={28} x2={212} y={238} cx={120} dipWidth={132} depth={6} color={C.sandEdge} fill={C.sand} fillDepth={26} />
      <Camel x={48} y={238} scale={0.92} />
      <ArabicLabel at={[120, 282]} text="خفّ واسع — ثقل أكبر" size={15} color={C.blue} />
      <ArabicLabel at={[120, 306]} text="يغوص قليلًا" size={15} color={C.green} />

      <Panel x={240} y={10} w={216} h={304} />
      <ArabicLabel at={[348, 42]} text="حافر الحصان (مكبّر)" size={18} />
      <DippedSurface x1={256} x2={440} y={238} cx={348} dipWidth={52} depth={14} color={C.sandEdge} fill={C.sand} fillDepth={26} />
      <HorseLeg x={348} y={232} scale={1.05} />
      <ArabicLabel at={[348, 282]} text="حافر صغير — ثقل أصغر" size={15} color={C.blue} />
      <ArabicLabel at={[348, 306]} text="يغوص أكثر" size={15} color={C.red} />

      <Panel x={468} y={10} w={216} h={304} />
      <ArabicLabel at={[576, 42]} text="المتزلج على الثلج" size={18} />
      <DippedSurface x1={484} x2={668} y={238} cx={576} dipWidth={150} depth={5} color={C.snowEdge} fill={C.snow} fillDepth={26} />
      <Skier x={576} y={236} scale={1.05} />
      <ArabicLabel at={[576, 282]} text="زلاجات عريضة" size={15} color={C.blue} />
      <ArabicLabel at={[576, 306]} text="لا يغوص في الثلج" size={15} color={C.green} />
    </>
  );
  const narrowPanel = (y: number, title: string, scene: React.ReactNode, line1: string, line2: string, color2: string) => (
    <g>
      <Panel x={8} y={y} w={384} h={208} />
      <ArabicLabel at={[200, y + 28]} text={title} size={18.5} />
      {/* المشاهد مرسومة بإحداثيات اللوحة الأولى (قاعدة 8) وتُزاح لكل لوحة مع هامش تحت العنوان */}
      <g transform={`translate(0 ${y + 4})`}>{scene}</g>
      <ArabicLabel at={[200, y + 178]} text={line1} size={16} color={C.blue} />
      <ArabicLabel at={[200, y + 202]} text={line2} size={16} color={color2} />
    </g>
  );
  const narrow = (
    <>
      {narrowPanel(8, "الجمل على الرمل", (
        <g>
          <DippedSurface x1={24} x2={376} y={128} cx={200} dipWidth={150} depth={6} color={C.sandEdge} fill={C.sand} fillDepth={26} />
          <Camel x={122} y={128} scale={0.82} />
        </g>
      ), "خفّ واسع — ثقل أكبر", "يغوص قليلًا", C.green)}
      {narrowPanel(224, "حافر الحصان مكبّرًا", (
        <g>
          <DippedSurface x1={24} x2={376} y={128} cx={200} dipWidth={56} depth={14} color={C.sandEdge} fill={C.sand} fillDepth={26} />
          <HorseLeg x={200} y={122} scale={0.95} />
        </g>
      ), "حافر صغير — ثقل أصغر", "يغوص أكثر", C.red)}
      {narrowPanel(440, "المتزلج على الثلج", (
        <g>
          <DippedSurface x1={24} x2={376} y={128} cx={200} dipWidth={160} depth={5} color={C.snowEdge} fill={C.snow} fillDepth={26} />
          <Skier x={200} y={126} scale={0.95} />
        </g>
      ), "زلاجات عريضة", "لا يغوص في الثلج", C.green)}
    </>
  );
  return (
    <>
      <Plate variant="wide" viewBox="0 0 696 324" title="الجمل والحصان والمتزلج: دور مساحة السطح"
        desc="ثلاث لوحات: خفّ الجمل الواسع يغوص قليلًا رغم ثقله الأكبر، وحافر الحصان الصغير يغوص أكثر، وزلاجات المتزلج العريضة تمنع غوصه في الثلج." maxWidth="46rem">{wide}</Plate>
      <Plate variant="narrow" viewBox="0 0 400 656" title="الجمل والحصان والمتزلج: دور مساحة السطح"
        desc="نسخة الهاتف: الجمل والحصان والمتزلج في لوحات متتابعة بنفس التسميات." maxWidth="24rem">{narrow}</Plate>
    </>
  );
}

/* ═══════════════ 2) المسمار: طرف حاد / طرف عريض (ص 65 و67) ═══════════════ */

function NailScene({ cx, topY, sharp, depth }: { cx: number; topY: number; sharp: boolean; depth: number }) {
  const woodY = topY + 128;
  return (
    <g>
      {/* القوة نفسها على رأس المسمار */}
      <Vector from={[cx, topY + 6]} to={[cx, topY + 52]} color={C.red} />
      <Label at={[cx + 40, topY + 28]} tex="F" color={C.red} width={36} />
      {/* المسمار */}
      <rect x={cx - 13} y={topY + 56} width={26} height={9} rx={3} fill={C.metalEdge} />
      <rect x={cx - 5} y={topY + 65} width={10} height={58} fill={C.metal} stroke={C.metalEdge} strokeWidth={1.8} />
      {sharp
        ? <polygon points={`${cx - 5},${topY + 123} ${cx + 5},${topY + 123} ${cx},${topY + 123 + depth}`} fill={C.metal} stroke={C.metalEdge} strokeWidth={1.8} strokeLinejoin="round" />
        : <rect x={cx - 5} y={topY + 123} width={10} height={10} fill={C.metal} stroke={C.metalEdge} strokeWidth={1.8} />}
      {/* اللوح الخشبي */}
      <rect x={cx - 88} y={woodY} width={176} height={52} fill={C.wood} stroke={C.woodEdge} strokeWidth={2.4} />
      <line x1={cx - 78} y1={woodY + 18} x2={cx + 78} y2={woodY + 18} stroke={C.woodGrain} strokeWidth={2} strokeLinecap="round" />
      <line x1={cx - 78} y1={woodY + 36} x2={cx + 78} y2={woodY + 36} stroke={C.woodGrain} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

export function PressureNailFigure() {
  const wide = (
    <>
      <Panel x={12} y={10} w={328} h={292} />
      <ArabicLabel at={[176, 42]} text="الطرف الحاد في الخشب" size={18} />
      <NailScene cx={176} topY={52} sharp depth={34} />
      <ArabicLabel at={[176, 268]} text="مساحة صغيرة ← ضغط كبير" size={16} color={C.red} />
      <ArabicLabel at={[176, 292]} text="يخترق الخشب" size={15} color={C.green} />
      <Panel x={356} y={10} w={328} h={292} />
      <ArabicLabel at={[520, 42]} text="الطرف العريض في الخشب" size={18} />
      <NailScene cx={520} topY={52} sharp={false} depth={0} />
      <ArabicLabel at={[520, 268]} text="مساحة كبيرة ← ضغط صغير" size={16} color={C.blue} />
      <ArabicLabel at={[520, 292]} text="لا يخترق بسهولة" size={15} color={C.red} />
    </>
  );
  const narrow = (
    <>
      <Panel x={8} y={8} w={384} h={292} />
      <ArabicLabel at={[200, 40]} text="الطرف الحاد في الخشب" size={21} />
      <NailScene cx={200} topY={48} sharp depth={34} />
      <ArabicLabel at={[200, 254]} text="مساحة صغيرة ← ضغط كبير" size={18} color={C.red} />
      <ArabicLabel at={[200, 286]} text="يخترق الخشب" size={18} color={C.green} />
      <Panel x={8} y={312} w={384} h={292} />
      <ArabicLabel at={[200, 352]} text="الطرف العريض في الخشب" size={21} />
      <NailScene cx={200} topY={360} sharp={false} depth={0} />
      <ArabicLabel at={[200, 566]} text="مساحة كبيرة ← ضغط صغير" size={18} color={C.blue} />
      <ArabicLabel at={[200, 598]} text="لا يخترق بسهولة" size={18} color={C.red} />
    </>
  );
  return (
    <>
      <Plate variant="wide" viewBox="0 0 696 322" title="المسمار من طرفه الحاد ومن طرفه العريض"
        desc="القوة نفسها: الطرف الحاد مساحته صغيرة فيكون الضغط كبيرًا ويخترق الخشب، والطرف العريض مساحته كبيرة فيكون الضغط صغيرًا." maxWidth="46rem">{wide}</Plate>
      <Plate variant="narrow" viewBox="0 0 400 616" title="المسمار من طرفه الحاد ومن طرفه العريض"
        desc="نسخة الهاتف: لوحتا المسمار متتابعتين بنفس التسميات." maxWidth="24rem">{narrow}</Plate>
    </>
  );
}

/* ═══════════════ 3) تجربة الإسفنج (ص 66) — تُدوَّن في دفتر الطالب ═══════════════ */

function SpongePanel({ x, y, w, title, mode }: { x: number; y: number; w: number; title: string; mode: "flat" | "upright" | "loaded" }) {
  const cx = x + w / 2;
  // منطقة منفصلة للتسمية أسفل الإسفنج: لا يكتب النص فوق مسام الإسفنج.
  const spongeY = y + 160;
  const depth = mode === "flat" ? 7 : mode === "upright" ? 17 : 27;
  const bw = mode === "flat" ? 118 : 52;
  const bh = mode === "flat" ? 42 : 96;
  const blockX = cx - bw / 2;
  const blockY = spongeY + depth - bh;
  return (
    <g>
      <Panel x={x} y={y} w={w} h={248} />
      <ArabicLabel at={[cx, y + 32]} text={title} size={16.5} />
      <Sponge x={x + 16} y={spongeY} w={w - 32} h={38} cx={cx} dipWidth={bw + 26} depth={depth} />
      <MetalBlock x={blockX} y={blockY} w={bw} h={bh} />
      {mode === "loaded" && (
        <g>
          <rect x={cx - 21} y={blockY - 34} width={42} height={24} rx={4} fill="#5a4632" stroke="#3c2d1e" strokeWidth={2} />
          <path d={`M${cx - 10} ${blockY - 34} a10 8 0 0 1 20 0`} fill="none" stroke="#3c2d1e" strokeWidth={2.4} />
        </g>
      )}
      <Vector from={[x + w - 30, blockY + 6]} to={[x + w - 30, blockY + 44]} color={C.red} width={4.4} />
      <Label at={[x + w - 30, blockY - 12]} tex="F" color={C.red} width={34} size={15} />
      <ArabicLabel at={[cx, y + 238]} text={mode === "flat" ? "وجه كبير: انضغاط صغير" : mode === "upright" ? "وجه صغير: انضغاط أكبر" : "قوة أكبر: انضغاط أكبر"} size={14.5} color={mode === "flat" ? C.green : C.red} />
    </g>
  );
}

export function PressureSpongeFigure() {
  const wide = (
    <>
      <SpongePanel x={12} y={10} w={216} title="١) الوجه الكبير" mode="flat" />
      <SpongePanel x={240} y={10} w={216} title="٢) الوجه الصغير" mode="upright" />
      <SpongePanel x={468} y={10} w={216} title="٣) + ثقل إضافي" mode="loaded" />
    </>
  );
  const narrow = (
    <>
      <SpongePanel x={8} y={8} w={384} title="١) الوجه الكبير" mode="flat" />
      <SpongePanel x={8} y={268} w={384} title="٢) الوجه الصغير" mode="upright" />
      <SpongePanel x={8} y={528} w={384} title="٣) + ثقل إضافي" mode="loaded" />
    </>
  );
  return (
    <>
      <Plate variant="wide" viewBox="0 0 696 272" title="تجربة متوازي المستطيلات على الإسفنج"
        desc="ثلاث حالات: الوجه الكبير ينضغط معه الإسفنج قليلًا، والوجه الصغير ينضغط أكثر، وإضافة ثقل فوق الوجه الصغير تزيد الانضغاط." maxWidth="46rem">{wide}</Plate>
      <Plate variant="narrow" viewBox="0 0 400 788" title="تجربة متوازي المستطيلات على الإسفنج"
        desc="نسخة الهاتف: حالات التجربة الثلاث متتابعة بنفس التسميات." maxWidth="24rem">{narrow}</Plate>
    </>
  );
}

/* ═══════════════ 4) الضغط على وحدة المساحة (شرح التعريف، ص 66) ═══════════════ */

export function PressureUnitAreaFigure() {
  const cell = 58;
  const gap = 20; // شريط مخصّص لأسهم الصفّ الثاني لا يصطدم بالمربّع المظلّل.
  const gx = 70;
  const gy = 96;
  const rowY = (r: number) => gy + r * (cell + gap);
  const cells = [];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      const hl = r === 0 && c === 1;
      const x = gx + c * cell;
      const y = rowY(r);
      cells.push(
        <g key={`${r}-${c}`}>
          <rect x={x} y={y} width={cell} height={cell}
            fill={hl ? "#bcd9ef" : "#eef4fa"} stroke={C.blue} strokeWidth={hl ? 3 : 1.8} />
          {/* الأسهم في مساحة بين الصفوف: لا سهم فوق تسمية وحدة المساحة */}
          {!hl && (
            <Vector from={[x + cell / 2, r === 0 ? y - 34 : y - 16]}
              to={[x + cell / 2, r === 0 ? y - 8 : y - 4]} color={C.red} width={4.2} />
          )}
        </g>,
      );
    }
  }
  // التسمية جزء من الشبكة: تنتقل معها في نسخة الهاتف فلا تختفي خارجها.
  const grid = (
    <g>
      {cells}
      <Label at={[gx + cell + cell / 2, gy + cell / 2]} tex="1\,\text{m}^2" color={C.blue} width={76} size={16} />
    </g>
  );
  const wide = (
    <>
      <Panel x={12} y={10} w={400} h={272} />
      <ArabicLabel at={[212, 42]} text="القوة تتوزّع على السطح كله" size={18} />
      {grid}
      <ArabicLabel at={[212, 252]} text="المربّع المظلّل: وحدة مساحة واحدة" size={15} color={C.blue} />
      <Panel x={428} y={10} w={256} h={272} />
      <ArabicLabel at={[556, 52]} text="الضغط هو نصيب" size={17} />
      <ArabicLabel at={[556, 78]} text="وحدة المساحة من القوة" size={17} />
      <Label at={[556, 138]} tex="P=\dfrac{F}{s}" color={C.gold} width={130} height={54} size={22} />
      <ArabicLabel at={[556, 196]} text="قوة أكبر على المساحة نفسها" size={14.5} color={C.ink2} />
      <ArabicLabel at={[556, 220]} text="← ضغط أكبر" size={14.5} color={C.red} />
      <ArabicLabel at={[556, 248]} text="مساحة أكبر للقوة نفسها ← ضغط أصغر" size={14.5} color={C.blue} />
    </>
  );
  const narrow = (
    <>
      <Panel x={8} y={8} w={384} h={252} />
      <ArabicLabel at={[200, 40]} text="القوة تتوزّع على السطح كله" size={20} />
      <g transform="translate(-24 6) scale(0.94)">{grid}</g>
      <ArabicLabel at={[200, 246]} text="المربّع المظلّل: وحدة مساحة واحدة" size={17} color={C.blue} />
      <Panel x={8} y={272} w={384} h={196} />
      <ArabicLabel at={[200, 306]} text="الضغط هو نصيب وحدة المساحة من القوة" size={19} />
      <Label at={[200, 356]} tex="P=\dfrac{F}{s}" color={C.gold} width={140} height={56} size={24} />
      <ArabicLabel at={[200, 408]} text="قوة أكبر ← ضغط أكبر" size={17} color={C.red} />
      <ArabicLabel at={[200, 436]} text="مساحة أكبر ← ضغط أصغر" size={17} color={C.blue} />
    </>
  );
  return (
    <>
      <Plate variant="wide" viewBox="0 0 696 292" title="الضغط: نصيب وحدة المساحة من القوة"
        desc="سطح مقسّم إلى مربعات وحدة، القوة موزعة عليها بأسهم متساوية، والمربع المظلّل يمثّل مترًا مربعًا واحدًا. الضغط يساوي القوة مقسومة على المساحة." maxWidth="46rem">{wide}</Plate>
      <Plate variant="narrow" viewBox="0 0 400 476" title="الضغط: نصيب وحدة المساحة من القوة"
        desc="نسخة الهاتف: شبكة وحدات المساحة ثم قانون الضغط." maxWidth="24rem">{narrow}</Plate>
    </>
  );
}

/* ═══════════════ 5) الباسكال (ص 67) ═══════════════ */

export function PressurePascalFigure() {
  const scene = (ox: number, oy: number, sq: number, narrow = false) => (
    <g>
      <Vector from={[ox + sq / 2, oy - 56]} to={[ox + sq / 2, oy - 8]} color={C.red} />
      <Label at={[ox + sq / 2 + 52, oy - 34]} tex="1\,\text{N}" color={C.red} width={64} size={narrow ? 22 : 17} />
      <rect x={ox} y={oy} width={sq} height={sq} fill="#eef4fa" stroke={C.blue} strokeWidth={3} />
      <line x1={ox} y1={oy + sq / 2} x2={ox + sq} y2={oy + sq / 2} stroke={C.blue} strokeWidth={1.4} strokeDasharray="6 5" />
      <line x1={ox + sq / 2} y1={oy} x2={ox + sq / 2} y2={oy + sq} stroke={C.blue} strokeWidth={1.4} strokeDasharray="6 5" />
      {/* بُعد المربع الجانبي فقط (البُعد العلوي يزاحم عنوان اللوحة) */}
      <Label at={[ox - 34, oy + sq / 2]} tex="1\,\text{m}" color={C.ink2} width={60} size={narrow ? 21 : 16} />
    </g>
  );
  const wide = (
    <>
      <Panel x={12} y={10} w={400} h={292} />
      <ArabicLabel at={[212, 40]} text="قوة نيوتن واحد على متر مربع واحد" size={17.5} />
      {scene(122, 108, 180)}
      <Panel x={428} y={10} w={256} h={292} />
      <ArabicLabel at={[556, 62]} text="الناتج هو" size={18} />
      <ArabicLabel at={[556, 92]} text="وحدة الضغط الدولية" size={18} />
      <Label at={[556, 156]} tex="1\,\text{Pa}" color={C.gold} width={120} height={52} size={26} />
      <Label at={[556, 216]} tex="1\,\text{Pa}=1\,\text{N.m}^{-2}" color={C.ink2} width={190} size={16} />
      <ArabicLabel at={[556, 262]} text="الباسكال Pa" size={17} color={C.gold} />
    </>
  );
  const narrow = (
    <>
      <Panel x={8} y={8} w={384} h={330} />
      <ArabicLabel at={[200, 40]} text="نيوتن واحد على متر مربع واحد" size={20} />
      {scene(112, 116, 176, true)}
      <Panel x={8} y={350} w={384} h={172} />
      <ArabicLabel at={[200, 384]} text="الناتج: وحدة الضغط الدولية" size={20} />
      <Label at={[200, 428]} tex="1\,\text{Pa}" color={C.gold} width={130} height={54} size={27} />
      <Label at={[200, 482]} tex="1\,\text{Pa}=1\,\text{N.m}^{-2}" color={C.ink2} width={210} size={19} />
    </>
  );
  return (
    <>
      <Plate variant="wide" viewBox="0 0 696 312" title="الباسكال: نيوتن واحد على متر مربع واحد"
        desc="مربع طول ضلعه متر واحد تؤثر عليه قوة شدتها نيوتن واحد عموديًا، فيكون الضغط باسكالًا واحدًا." maxWidth="46rem">{wide}</Plate>
      <Plate variant="narrow" viewBox="0 0 400 530" title="الباسكال: نيوتن واحد على متر مربع واحد"
        desc="نسخة الهاتف: مربع الباسكال ثم الناتج." maxWidth="24rem">{narrow}</Plate>
    </>
  );
}

/* ═══════════════ 6) النصب التذكاري (تطبيق ص 67) ═══════════════ */

function Statue({ cx, groundY, scale = 1 }: { cx: number; groundY: number; scale?: number }) {
  return (
    <g transform={`translate(${cx} ${groundY}) scale(${scale})`} strokeLinejoin="round" strokeLinecap="round">
      {/* القاعدة */}
      <rect x={-92} y={-26} width={184} height={26} fill={C.metal} stroke={C.metalEdge} strokeWidth={2.6} />
      {/* التمثال: رداء ورأس وذراعان */}
      <path d="M-26 -26 L-18 -104 Q-16 -118 0 -118 Q16 -118 18 -104 L26 -26 Z" fill={C.body} stroke={C.bodyEdge} strokeWidth={2.6} />
      <path d="M-20 -96 L-44 -64" stroke={C.bodyEdge} strokeWidth={8} fill="none" />
      <path d="M20 -96 L42 -70" stroke={C.bodyEdge} strokeWidth={8} fill="none" />
      <circle cx={0} cy={-132} r={14} fill={C.body} stroke={C.bodyEdge} strokeWidth={2.6} />
      <path d="M-13 -140 Q0 -152 13 -140" stroke={C.bodyEdge} strokeWidth={3.4} fill="none" />
    </g>
  );
}

export function PressureStatueFigure() {
  const wide = (
    <>
      <Ground x1={36} x2={660} y={252} />
      <Statue cx={250} groundY={252} />
      {/* ثقل النصب وثقل القاعدة */}
      <Vector from={[250, 84]} to={[250, 112]} color={C.red} />
      <Label at={[318, 100]} tex="10000\,\text{N}" color={C.red} width={104} size={15} />
      <Carrier from={[342, 226]} to={[392, 226]} color={C.guide} />
      <Label at={[452, 226]} tex="5000\,\text{N}" color={C.red} width={96} size={15} />
      <ArabicLabel at={[452, 202]} text="ثقل القاعدة" size={14.5} color={C.ink2} />
      {/* مساحة قاعدة الاستناد */}
      <Measure x1={158} x2={342} y={282} />
      <Label at={[250, 306]} tex="s=1.5\,\text{m}^2" color={C.blue} width={110} size={16} />
      {/* النتيجة */}
      <Panel x={452} y={96} w={220} h={76} />
      <ArabicLabel at={[562, 122]} text="الضغط على الأرض" size={15} color={C.ink2} />
      <Label at={[562, 152]} tex="P=10^{4}\,\text{Pa}" color={C.gold} width={140} size={19} />
    </>
  );
  const narrow = (
    <>
      <Ground x1={20} x2={380} y={264} />
      <Statue cx={170} groundY={264} scale={0.94} />
      <Vector from={[170, 92]} to={[170, 128]} color={C.red} />
      <Label at={[238, 108]} tex="10000\,\text{N}" color={C.red} width={108} size={18} />
      <Label at={[292, 238]} tex="5000\,\text{N}" color={C.red} width={100} size={17} />
      <ArabicLabel at={[292, 214]} text="ثقل القاعدة" size={16} color={C.ink2} />
      <Measure x1={84} x2={256} y={294} />
      <Label at={[170, 320]} tex="s=1.5\,\text{m}^2" color={C.blue} width={118} size={19} />
      <Panel x={62} y={336} w={276} h={72} />
      <ArabicLabel at={[200, 362]} text="الضغط على الأرض" size={17} color={C.ink2} />
      <Label at={[200, 392]} tex="P=10^{4}\,\text{Pa}" color={C.gold} width={150} size={21} />
    </>
  );
  return (
    <>
      <Plate variant="wide" viewBox="0 0 696 322" title="النصب التذكاري وقاعدته على أرض الحديقة"
        desc="ثقل النصب عشرة آلاف نيوتن وثقل قاعدته خمسة آلاف نيوتن على مساحة متر ونصف مربع، فيكون الضغط عشرة آلاف باسكال." maxWidth="46rem">{wide}</Plate>
      <Plate variant="narrow" viewBox="0 0 400 420" title="النصب التذكاري وقاعدته على أرض الحديقة"
        desc="نسخة الهاتف: النصب وقاعدته بنفس القيم والنتيجة." maxWidth="24rem">{narrow}</Plate>
    </>
  );
}

/* ═══════════════ 7) جسم مستند بثقله على سطح أفقي (ص 68) ═══════════════ */

export function PressureBlockWeightFigure() {
  const scene = (cx: number, groundY: number, bw: number, bh: number, narrow = false) => (
    <g>
      <Ground x1={cx - bw - 90} x2={cx + bw + 90} y={groundY} />
      <rect x={cx - bw / 2} y={groundY - bh} width={bw} height={bh} rx={6} fill="#ffffff" stroke={C.bodyEdge} strokeWidth={2.8} />
      {/* مركز الثقل وسهم الثقل */}
      <PointMark at={[cx, groundY - bh + 26]} color={C.red} r={4} />
      <Label at={[cx + 26, groundY - bh + 24]} tex="O" color={C.red} width={30} size={narrow ? 21 : 16} />
      <Vector from={[cx, groundY - bh + 30]} to={[cx, groundY - 16]} color={C.red} />
      <Label at={[cx + 58, groundY - bh / 2]} tex="mg" color={C.red} width={48} size={narrow ? 22 : 17} />
      {/* بصمة التماسّ */}
      <rect x={cx - bw / 2} y={groundY - 5} width={bw} height={7} fill="#bcd9ef" stroke={C.blue} strokeWidth={1.8} />
      <Measure x1={cx - bw / 2} x2={cx + bw / 2} y={groundY + 30} />
    </g>
  );
  const wide = (
    <>
      {scene(230, 218, 120, 158)}
      <Label at={[230, 274]} tex="s=0.01\,\text{m}^2" color={C.blue} width={124} size={16} />
      <Panel x={428} y={52} w={244} h={196} />
      <ArabicLabel at={[550, 84]} text="المعطيات" size={17} />
      <Label at={[550, 122]} tex="m=5\,\text{kg}" color={C.ink} width={110} size={17} />
      <Label at={[550, 156]} tex="g=10\,\text{m.s}^{-2}" color={C.ink} width={140} size={16} />
      <ArabicLabel at={[550, 196]} text="القوة الضاغطة هي الثقل" size={15} color={C.ink2} />
      <Label at={[550, 226]} tex="F=mg" color={C.red} width={80} size={17} />
    </>
  );
  const narrow = (
    <>
      {scene(200, 232, 122, 164, true)}
      <Label at={[200, 288]} tex="s=0.01\,\text{m}^2" color={C.blue} width={132} size={19} />
      <Panel x={52} y={308} w={296} h={132} />
      <Label at={[200, 342]} tex="m=5\,\text{kg}" color={C.ink} width={118} size={20} />
      <Label at={[200, 376]} tex="g=10\,\text{m.s}^{-2}" color={C.ink} width={150} size={19} />
      <Label at={[200, 412]} tex="F=mg" color={C.red} width={86} size={20} />
    </>
  );
  return (
    <>
      <Plate variant="wide" viewBox="0 0 696 292" title="جسم مستند بثقله على سطح أفقي"
        desc="جسم كتلته خمسة كيلوغرامات، سهم ثقله من مركزه نحو الأسفل، وبصمة تماسه على السطح مساحتها 0.01 متر مربع." maxWidth="46rem">{wide}</Plate>
      <Plate variant="narrow" viewBox="0 0 400 452" title="جسم مستند بثقله على سطح أفقي"
        desc="نسخة الهاتف: الجسم وسهم ثقله وبصمة تماسه ثم المعطيات." maxWidth="24rem">{narrow}</Plate>
    </>
  );
}

/* ═══════════════ 8) تطبيقات إنقاص الضغط وزيادته (ص 69) ═══════════════ */

function AppPanel({ x, y, w, h, title, children, foot, footColor }: {
  x: number; y: number; w: number; h: number; title: string; children: React.ReactNode; foot: string; footColor: string;
}) {
  return (
    <g>
      <Panel x={x} y={y} w={w} h={h} />
      <ArabicLabel at={[x + w / 2, y + 30]} text={title} size={16} />
      {children}
      <ArabicLabel at={[x + w / 2, y + h - 16]} text={foot} size={14.5} color={footColor} />
    </g>
  );
}

export function PressureApplicationsFigure() {
  const camelFoot = (cx: number, gy: number) => (
    <g>
      <DippedSurface x1={cx - 88} x2={cx + 88} y={gy} cx={cx} dipWidth={86} depth={6} color={C.sandEdge} fill={C.sand} fillDepth={18} />
      <path d={`M${cx - 12} ${gy - 74} L${cx - 8} ${gy - 12} L${cx - 30} ${gy - 4} L${cx + 34} ${gy - 4} L${cx + 10} ${gy - 12} L${cx + 12} ${gy - 74} Z`} fill={C.body} stroke={C.bodyEdge} strokeWidth={2.4} strokeLinejoin="round" />
    </g>
  );
  const truck = (cx: number, gy: number) => (
    <g>
      <Ground x1={cx - 92} x2={cx + 92} y={gy} />
      <rect x={cx - 84} y={gy - 62} width={128} height={40} rx={5} fill={C.body} stroke={C.bodyEdge} strokeWidth={2.4} />
      <path d={`M${cx + 44} ${gy - 44} L${cx + 66} ${gy - 44} L${cx + 76} ${gy - 22} L${cx + 44} ${gy - 22} Z`} fill={C.body} stroke={C.bodyEdge} strokeWidth={2.4} strokeLinejoin="round" />
      {[-58, -16, 34].map((dx) => (
        <g key={dx}>
          <circle cx={cx + dx} cy={gy - 11} r={13} fill="#28384c" stroke="#141f2c" strokeWidth={3.4} />
          <circle cx={cx + dx} cy={gy - 11} r={4.6} fill="#dfe8ee" />
        </g>
      ))}
    </g>
  );
  const bandage = (cx: number, gy: number) => (
    <g>
      <path d={`M${cx - 88} ${gy - 26} Q${cx} ${gy - 40} ${cx + 88} ${gy - 22} L${cx + 84} ${gy + 8} Q${cx} ${gy - 2} ${cx - 84} ${gy + 10} Z`} fill="#eec39a" stroke="#b98a5a" strokeWidth={2.4} strokeLinejoin="round" />
      <rect x={cx - 30} y={gy - 36} width={52} height={46} rx={7} fill="#ffffff" stroke={C.blue} strokeWidth={2.4} transform={`rotate(-4 ${cx - 4} ${gy - 13})`} />
      <line x1={cx - 22} y1={gy - 26} x2={cx + 14} y2={gy - 30} stroke={C.blue} strokeWidth={1.6} strokeDasharray="5 4" />
      <line x1={cx - 24} y1={gy - 8} x2={cx + 12} y2={gy - 12} stroke={C.blue} strokeWidth={1.6} strokeDasharray="5 4" />
    </g>
  );
  const straps = (cx: number, gy: number) => (
    <g>
      {/* كتف وحقيبة بحزام رفيع */}
      <path d={`M${cx - 70} ${gy - 62} Q${cx - 46} ${gy - 76} ${cx - 28} ${gy - 58}`} fill="none" stroke={C.bodyEdge} strokeWidth={9} strokeLinecap="round" />
      <line x1={cx - 50} y1={gy - 66} x2={cx - 58} y2={gy - 16} stroke={C.red} strokeWidth={3.4} />
      <rect x={cx - 78} y={gy - 16} width={42} height={32} rx={6} fill="#f3c1cd" stroke={C.red} strokeWidth={2.2} />
      <ArabicLabel at={[cx - 72, gy + 34]} text="رفيع: ضغط أكبر" size={13.5} color={C.red} />
      {/* كتف وحقيبة بحزام عريض */}
      <path d={`M${cx + 28} ${gy - 62} Q${cx + 52} ${gy - 76} ${cx + 70} ${gy - 58}`} fill="none" stroke={C.bodyEdge} strokeWidth={9} strokeLinecap="round" />
      <path d={`M${cx + 44} ${gy - 68} L${cx + 38} ${gy - 16} L${cx + 54} ${gy - 16} L${cx + 56} ${gy - 64}`} fill="#bcd9ef" stroke={C.blue} strokeWidth={2} strokeLinejoin="round" />
      <rect x={cx + 24} y={gy - 16} width={42} height={32} rx={6} fill="#dcebf7" stroke={C.blue} strokeWidth={2.2} />
      <ArabicLabel at={[cx + 72, gy + 34]} text="عريض: ضغط أصغر" size={13.5} color={C.green} />
    </g>
  );
  const wide = (
    <>
      <AppPanel x={12} y={10} w={328} h={176} title="خفّ الجمل الواسع" foot="مساحة أكبر ← ضغط أصغر" footColor={C.green}>{camelFoot(176, 132)}</AppPanel>
      <AppPanel x={356} y={10} w={328} h={176} title="إطارات الشاحنة العريضة الكثيرة" foot="توزيع الثقل على مساحة أكبر" footColor={C.green}>{truck(520, 136)}</AppPanel>
      <AppPanel x={12} y={198} w={328} h={176} title="الرباط العريض على الجرح" foot="مساحة أكبر ← ضغط أصغر" footColor={C.green}>{bandage(176, 306)}</AppPanel>
      <AppPanel x={356} y={198} w={328} h={176} title="حزام الحقيبة: رفيع أم عريض؟" foot="المساحة تصنع الفرق" footColor={C.blue}>{straps(520, 300)}</AppPanel>
    </>
  );
  const narrowPanel = (y: number, title: string, scene: React.ReactNode, foot: string, color: string) => (
    <AppPanel x={8} y={y} w={384} h={176} title={title} foot={foot} footColor={color}>{scene}</AppPanel>
  );
  const narrow = (
    <>
      {narrowPanel(8, "خفّ الجمل الواسع", camelFoot(200, 130), "مساحة أكبر ← ضغط أصغر", C.green)}
      {narrowPanel(196, "إطارات الشاحنة العريضة الكثيرة", truck(200, 322), "توزيع الثقل على مساحة أكبر", C.green)}
      {narrowPanel(384, "الرباط العريض على الجرح", bandage(200, 492), "مساحة أكبر ← ضغط أصغر", C.green)}
      {/* لوحة الحزام أطول قليلًا: تسميتا الحزامين ثم التذييل في نطاقات منفصلة. */}
      <AppPanel x={8} y={572} w={384} h={200} title="حزام الحقيبة: رفيع أم عريض؟"
        foot="المساحة تصنع الفرق" footColor={C.blue}>{straps(200, 686)}</AppPanel>
    </>
  );
  return (
    <>
      <Plate variant="wide" viewBox="0 0 696 384" title="تطبيقات الضغط في الحياة"
        desc="أربع لوحات: خفّ الجمل الواسع، إطارات الشاحنة العريضة الكثيرة، الرباط العريض، وحزام الحقيبة الرفيع مقابل العريض." maxWidth="46rem">{wide}</Plate>
      <Plate variant="narrow" viewBox="0 0 400 780" title="تطبيقات الضغط في الحياة"
        desc="نسخة الهاتف: لوحات التطبيقات الأربع متتابعة." maxWidth="24rem">{narrow}</Plate>
    </>
  );
}

/* ═══════════════ 9) خريطة المفاهيم مكتملة (ص 70 — للمراجعة) ═══════════════ */

function MapBox({ x, y, w, h, lines, accent = C.ink, fill = "#ffffff" }: {
  x: number; y: number; w: number; h: number; lines: string[]; accent?: string; fill?: string;
}) {
  const cy = y + h / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={12} fill={fill} stroke={accent} strokeWidth={2.2} />
      {lines.map((line, i) => (
        <ArabicLabel key={i} at={[x + w / 2, cy + (i - (lines.length - 1) / 2) * 24 + 6]} text={line} size={16} color={accent} />
      ))}
    </g>
  );
}

function MapArrow({ from, to }: { from: [number, number]; to: [number, number] }) {
  return <Vector from={from} to={to} color={C.ink2} width={3.6} />;
}

export function PressureConceptMapFigure() {
  const wide = (
    <>
      <MapBox x={278} y={18} w={140} h={52} lines={["الضغط"]} accent={C.gold} fill="#fdf6e0" />
      {/* إلى وحدة القياس */}
      <MapArrow from={[278, 44]} to={[196, 44]} />
      <MapBox x={36} y={18} w={160} h={52} lines={["وحدة قياسه الدولية"]} accent={C.blue} />
      <MapArrow from={[116, 70]} to={[116, 104]} />
      <MapBox x={36} y={104} w={160} h={52} lines={["الباسكال Pa"]} accent={C.gold} fill="#fdf6e0" />
      {/* إلى العاملين */}
      <MapArrow from={[348, 70]} to={[348, 104]} />
      <MapBox x={268} y={104} w={160} h={52} lines={["يتعلّق بـ"]} accent={C.violet} />
      <MapArrow from={[300, 156]} to={[212, 196]} />
      <MapArrow from={[396, 156]} to={[484, 196]} />
      <MapBox x={92} y={196} w={240} h={64} lines={["شدّة القوة الضاغطة", "يتناسب معها طردًا"]} accent={C.red} />
      <MapBox x={364} y={196} w={240} h={64} lines={["مساحة السطح الذي", "تتوزّع عليه القوة — عكسًا"]} accent={C.blue} />
      <Label at={[348, 292]} tex="P=\dfrac{F}{s}" color={C.gold} width={120} height={44} size={20} />
    </>
  );
  const narrow = (
    <>
      <MapBox x={110} y={14} w={180} h={56} lines={["الضغط"]} accent={C.gold} fill="#fdf6e0" />
      <MapArrow from={[200, 70]} to={[200, 100]} />
      <MapBox x={70} y={100} w={260} h={56} lines={["وحدة قياسه الدولية: الباسكال Pa"]} accent={C.blue} />
      <MapArrow from={[200, 156]} to={[200, 186]} />
      <MapBox x={110} y={186} w={180} h={56} lines={["يتعلّق بـ"]} accent={C.violet} />
      <MapArrow from={[200, 242]} to={[200, 272]} />
      <MapBox x={50} y={272} w={300} h={62} lines={["شدّة القوة الضاغطة — طردًا"]} accent={C.red} />
      <MapArrow from={[200, 334]} to={[200, 364]} />
      <MapBox x={50} y={364} w={300} h={62} lines={["مساحة السطح — عكسًا"]} accent={C.blue} />
      <Label at={[200, 462]} tex="P=\dfrac{F}{s}" color={C.gold} width={130} height={48} size={22} />
    </>
  );
  return (
    <>
      <Plate variant="wide" viewBox="0 0 696 316" title="خريطة مفاهيم الضغط مكتملة"
        desc="الضغط وحدته الدولية الباسكال، ويتعلق بشدة القوة الضاغطة طردًا وبمساحة السطح عكسًا، وقانونه الضغط يساوي القوة على المساحة." maxWidth="46rem">{wide}</Plate>
      <Plate variant="narrow" viewBox="0 0 400 492" title="خريطة مفاهيم الضغط مكتملة"
        desc="نسخة الهاتف: خريطة المفاهيم عمودية بنفس العناصر." maxWidth="24rem">{narrow}</Plate>
    </>
  );
}
