"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft, ChevronRight, Gauge, Orbit, Play, Radar,
  RotateCcw, Square,
} from "lucide-react";
import { TeX, SvgTeX } from "@/components/math/TeX";
import { graphDistance, observerPositions, pathPoint } from "@/lib/motion-model";

const TABS = [
  { id: "observer", label: "نسبية الحركة",   icon: Radar },
  { id: "path",     label: "أشكال المسار",    icon: Orbit },
  { id: "graph",    label: "بنِ الرسم البياني", icon: Gauge },
] as const;
type TabId = (typeof TABS)[number]["id"];
type Ref   = "road" | "driver" | "moon";
type Path  = "straight" | "curved" | "circle";
type Mode  = "uniform" | "accelerating" | "decelerating" | "changing" | "stationary";

/* ══════════════════ wrapper ══════════════════ */
export function MotionPlayground() {
  const [tab, setTab] = useState<TabId>("observer");
  return (
    <div className="lab-card overflow-hidden">
      {/* header */}
      <div className="bg-[#0d1b2e] px-6 py-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[rgba(0,229,255,0.15)] px-4 py-1 text-[12px] font-black text-[#00e5ff] border border-[rgba(0,229,255,0.3)]">
            مختبر حركي تفاعلي
          </span>
          <h3 className="text-[20px] font-black text-white">جرّب الحركة بيدك</h3>
        </div>
        <p className="mt-1.5 max-w-3xl text-[13px] leading-7 text-[rgba(255,255,255,0.65)]">
          ثلاث تجارب حية: غيّر الجسم المرجع، تحكّم بشكل المسار، وابنِ الرسم البياني لحظة بلحظة.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {TABS.map((t) => {
            const I = t.icon;
            const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-black transition-all ${
                  on ? "bg-[#0066cc] text-white" : "text-[rgba(255,255,255,0.55)] hover:text-white hover:bg-[rgba(255,255,255,0.08)]"
                }`}>
                <I className="h-4 w-4" />{t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-[#f5f8fc] p-6">
        {tab === "observer" && <ObserverLab />}
        {tab === "path"     && <PathLab />}
        {tab === "graph"    && <GraphLab />}
      </div>
    </div>
  );
}

/* ══════════════════ تجربة 1 — نسبية الحركة ══════════════════ */
function ObserverLab() {
  const [refChoice, setRefChoice] = useState<Ref>("road");
  const raf = useRef(0);
  const epochRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const W = 640, H = 240;

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    cv.width = W; cv.height = H;
    cv.style.width = "100%"; cv.style.height = "auto";
    function draw(now: number) {
      const cv = canvasRef.current; if (!cv) return;
      const ctx = cv.getContext("2d")!;
      if (!epochRef.current) epochRef.current = now;
      const t = (now - epochRef.current) / 1000;
      const positions = observerPositions(t, refChoice);

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(0, 0, W, H);

      /* road */
      ctx.fillStyle = "#cbd5e1"; ctx.fillRect(0, H - 60, W, 60);
      ctx.strokeStyle = "#ffffff"; ctx.setLineDash([20, 16]); ctx.lineWidth = 2.5;
      ctx.lineDashOffset = -positions.ground;
      ctx.beginPath(); ctx.moveTo(0, H - 30); ctx.lineTo(W, H - 30); ctx.stroke();
      ctx.lineDashOffset = 0;
      ctx.setLineDash([]);

      /* bus */
      const busX = positions.bus;
      drawBus(ctx, busX, H - 60);

      /* walker inside bus */
      const walkerAbsX = positions.walker;
      drawPerson(ctx, walkerAbsX, H - 90, "#ffb03a", "B");

      /* seated passenger */
      drawPerson(ctx, busX + 110, H - 90, "#3ce0f4", "A");

      /* شاخصة ثابتة على الطريق */
      const signX = 90 + positions.ground;
      ctx.fillStyle = "#64748b"; ctx.fillRect(signX - 2, H - 105, 4, 45);
      ctx.fillStyle = "#dc2626"; ctx.beginPath(); ctx.arc(signX, H - 110, 11, 0, 2 * Math.PI); ctx.fill();

      /* tree */
      const treeX = positions.tree;
      drawTree(ctx, treeX, H - 60);

      /* moon observer */
      if (refChoice === "moon") {
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.beginPath(); ctx.arc(W / 2, 42, 32, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#e8f0fc"; ctx.font = "bold 13px Cairo, sans-serif"; ctx.textAlign = "center";
        ctx.fillText("رائد الفضاء", W / 2, 48);
      }

      raf.current = requestAnimationFrame(draw);
    }

    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [refChoice]);

  const refDesc: Record<Ref, { title: string; rows: { who: string; state: string; why: string }[] }> = {
    road: {
      title: "المرجع: الشاخصة المرورية (ثابتة)",
      rows: [
        { who: "الراكب A", state: "متحرك", why: "يتغير موضعه مع الحافلة بالنسبة للمرجع" },
        { who: "الراكب B", state: "متحرك", why: "يتغير موضعه داخل الحافلة ومعها" },
        { who: "الحافلة", state: "متحركة", why: "موضعها يتغير بالنسبة للشاخصة" },
        { who: "الشجرة", state: "ساكنة", why: "موضعها ثابت بالنسبة للشاخصة" },
      ],
    },
    driver: {
      title: "المرجع: السائق (يتحرك مع الحافلة)",
      rows: [
        { who: "الراكب A", state: "ساكن", why: "موضعه ثابت بالنسبة للسائق" },
        { who: "الراكب B", state: "متحرك", why: "يمشي داخل الحافلة فيتغير موضعه بالنسبة للسائق" },
        { who: "الشجرة", state: "متحركة !", why: "يتغير موضعها بعكس حركة الحافلة" },
        { who: "الطريق", state: "متحرك !", why: "يتحرك بعكس حركة الحافلة بالنسبة للسائق" },
      ],
    },
    moon: {
      title: "المرجع: رائد فضاء على القمر",
      rows: [
        { who: "الراكب A", state: "متحرك", why: "يتغير موضعه مع الأرض والحافلة في هذا النموذج" },
        { who: "الحافلة", state: "متحركة", why: "تتحرك على أرض متحركة" },
        { who: "الشجرة", state: "متحركة", why: "ثابتة على الأرض ولكن الأرض تدور" },
        { who: "الشاخصة", state: "متحركة", why: "يتغير موضعها مع الأرض في هذا النموذج" },
      ],
    },
  };
  const desc = refDesc[refChoice];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {([["road","الشاخصة المرورية"],["driver","السائق"],["moon","رائد الفضاء"]] as [Ref,string][]).map(([id,label])=>(
          <button key={id} onClick={()=>setRefChoice(id)}
            className={`rounded-xl px-4 py-2 text-[13px] font-black border transition-all ${
              refChoice===id ? "bg-[#0066cc] text-white border-[#0066cc]"
                             : "bg-white text-[#4a6080] border-[rgba(10,40,90,0.2)] hover:border-[#0066cc]"
            }`}>
            المرجع: {label}
          </button>
        ))}
      </div>

      <div className="lab-canvas">
        <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "auto" }} />
      </div>

      <div className="rounded-2xl bg-white border border-[rgba(10,40,90,0.12)] overflow-hidden">
        <div className="bg-[#0066cc] px-5 py-3 text-[13px] font-black text-white">{desc.title}</div>
        <div className="divide-y divide-[rgba(10,40,90,0.08)]">
          {desc.rows.map((r) => (
            <div key={r.who} className="grid grid-cols-[90px_80px_1fr] items-center gap-3 px-5 py-3">
              <span className="text-[13px] font-black text-[#0d1b2e]">{r.who}</span>
              <span className={`rounded-full px-3 py-1 text-center text-[11.5px] font-black ${
                r.state.startsWith("ساكن") ? "bg-[#d4f7e8] text-[#007a3d]" : "bg-[#cce0ff] text-[#0066cc]"
              }`}>{r.state}</span>
              <span className="text-[12.5px] font-bold text-[#4a6080]">{r.why}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[12px] font-bold text-[#4a6080]">رسم توضيحي مبسّط: تتحرك الحافلة والراكب ذهاباً وإياباً. في مرجع القمر نمثل حركة الأرض بإزاحة مبسطة غير مرسومة بمقياس فلكي.</p>
      <p className="rounded-xl bg-[#cce0ff] border border-[rgba(0,102,204,0.3)] px-4 py-3 text-[13px] font-bold text-[#003d80]">
        💡 الاستنتاج: نفس الجسم قد يكون ساكناً أو متحركاً حسب الجسم المرجع الذي نختاره.
        الحركة والسكون مفهومان نسبيان دائماً.
      </p>
    </div>
  );
}

/* ══════════════════ تجربة 2 — أشكال المسار ══════════════════ */
function PathLab() {
  const [path, setPath] = useState<Path>("circle");
  const [speed, setSpeed] = useState(1.0);
  const [trail, setTrail] = useState(true);
  const raf = useRef(0);
  const tRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dots = useRef<{ x: number; y: number; a: number }[]>([]);

  const W = 640, H = 300;

  const speedRef = useRef(speed);
  const trailRef = useRef(trail);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { trailRef.current = trail; }, [trail]);
  const [distance, setDistance] = useState(0);
  const [finished, setFinished] = useState(false);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    cv.width = W; cv.height = H;
    tRef.current = 0; dots.current = [];
    let lastTime = 0, total = 0, done = false;
    let previous: {x: number; y: number} | null = null;
    setDistance(0); setFinished(false);
    const getPos = (p: number) => pathPoint(path, p);
    function draw(now: number) {
      const ctx = cv!.getContext("2d")!;
      const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 0;
      lastTime = now;
      tRef.current = Math.min(1, tRef.current + dt * speedRef.current / 10);
      const pos = getPos(tRef.current);
      if (previous) total += Math.hypot(pos.x - previous.x, pos.y - previous.y) / 10;
      previous = pos;
      setDistance(total);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0d1b2e"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
      ctx.beginPath();
      if (path === "straight") { ctx.moveTo(60, H / 2); ctx.lineTo(W - 60, H / 2); }
      else if (path === "curved") {
        for (let i = 0; i <= 100; i++) { const point = getPos(i / 100); if (i === 0) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y); }
      } else ctx.arc(W / 2, H / 2, 90, 0, Math.PI * 2);
      ctx.stroke(); ctx.setLineDash([]);
      if (!done) dots.current.push({ ...pos, a: 1 });
      if (trailRef.current) {
        ctx.fillStyle = "#00e5ff";
        for (const dot of dots.current) { ctx.beginPath(); ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.beginPath(); ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2); ctx.fillStyle = "#3b82f6"; ctx.fill();
      ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.stroke();
      if (tRef.current >= 1 && !done) { done = true; setFinished(true); }
      raf.current = requestAnimationFrame(draw);
    }
    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [path, runId]);

  const labels: Record<Path, string> = {
    straight: "المسار المستقيم — مثل السيارة على أوتوستراد مستقيم",
    curved: "المسار المنحني — مثل المتزلج على منحدر",
    circle: "المسار الدائري — مثل مقصورة عجلة الهواء",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        {([["straight","مستقيم"],["curved","منحنٍ"],["circle","دائري"]] as [Path,string][]).map(([id,label])=>(
          <button key={id} onClick={()=>{setPath(id); dots.current=[];}}
            className={`rounded-xl px-4 py-2 text-[13px] font-black border transition-all ${
              path===id ? "bg-[#6633cc] text-white border-[#6633cc]"
                        : "bg-white text-[#4a6080] border-[rgba(10,40,90,0.2)] hover:border-[#6633cc]"
            }`}>{label}</button>
        ))}
        <label className="flex items-center gap-2 text-[13px] font-bold text-[#4a6080] mr-auto">
          <input type="checkbox" checked={trail} onChange={e=>setTrail(e.target.checked)} className="accent-[#0066cc]" />
          إظهار الأثر
        </label>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[13px] font-bold text-[#4a6080]">سرعة العرض:</span>
        <input type="range" min="0.3" max="2.5" step="0.1" value={speed}
          onChange={e=>setSpeed(Number(e.target.value))} className="flex-1 accent-[#0066cc]" />
        <span className="text-[13px] font-black text-[#0066cc]">
          <TeX>{"\\times " + speed.toFixed(1)}</TeX>
        </span>
      </div>
      <div className="lab-canvas"><canvas ref={canvasRef} style={{ display:"block", width:"100%", height:"auto" }} /></div>
      <p className="text-[13px] font-bold text-[#4a6080]">المسافة المقطوعة: <TeX>{`d = ${distance.toFixed(1)} \\text{ m}`}</TeX> — مقياس الرسم: كل 10 وحدات رسم تمثل متراً. المسافة مستقلة عن إظهار الأثر.</p>
      <button onClick={() => setRunId(v => v + 1)} className="btn btn-ghost !py-2">إعادة المسار</button>
      {finished && <p className="text-[12px] font-bold text-[#4a6080]">اكتمل المسار؛ أعد تشغيله للمشاهدة مرة أخرى.</p>}
      <div className="rounded-xl bg-[#f0f4f8] border border-[rgba(10,40,90,0.12)] px-4 py-3 text-[13.5px] font-bold text-[#0d1b2e]">
        🔵 {labels[path]}
      </div>
    </div>
  );
}

/* ══════════════════ تجربة 3 — الرسم البياني الحي ══════════════════ */
function GraphLab() {
  const [mode, setMode] = useState<Mode>("uniform");
  const [running, setRunning] = useState(false);
  const [t, setT] = useState(0);
  const raf = useRef(0);
  const startTime = useRef(0);

  const MAX_T = 8;
  const getD = (s: number) => graphDistance(mode, s);

  useEffect(() => {
    if (!running) { cancelAnimationFrame(raf.current); return; }
    const step = (now: number) => {
      if (!startTime.current) startTime.current = now;
      const elapsed = (now - startTime.current) / 1000;
      const newT = Math.min(elapsed * 1.5, MAX_T);
      setT(newT);
      if (newT < MAX_T) raf.current = requestAnimationFrame(step);
      else setRunning(false);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [running]);

  const CW = 420, CH = 260, ML = 62, MR = 42, MT = 32, MB = 54;
  const iw = CW - ML - MR, ih = CH - MT - MB;
  const sx = (v: number) => ML + (v / MAX_T) * iw;
  const sy = (v: number) => CH - MB - (v / 200) * ih;

  const pts: { x: number; y: number }[] = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const s = (i / steps) * t;
    pts.push({ x: sx(s), y: sy(getD(s)) });
  }

  const colorMap = { uniform: "#059669", accelerating: "#dc2626", decelerating: "#b45309", changing: "#7c3aed", stationary: "#2563eb" };
  const color = colorMap[mode];

  const summaries: Record<Mode, string> = {
    uniform:     "الخط مستقيم لأن الجسم يقطع مسافات متساوية في أزمنة متساوية — سرعة ثابتة.",
    accelerating: "الخط منحنٍ لأن الجسم يقطع مسافات متزايدة — السرعة تكبر مع الزمن.",
    decelerating: "يقل ميل الخط مع الزمن: يقطع الجسم مسافات أصغر في فواصل زمنية متساوية.",
    changing: "الخط مكوّن من مقطعين مستقيمين مختلفي الميل: السرعة ثابتة في كل مقطع وتزداد عند الانتقال بينهما.",
    stationary:  "الخط أفقي تماماً لأن الجسم لا يتحرك — المسافة ثابتة بالنسبة للمرجع.",
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(colorMap) as Mode[]).map(id => (
            <button key={id} onClick={()=>{setMode(id);setT(0);setRunning(false);startTime.current=0;}}
              className={`rounded-xl px-4 py-2 text-[13px] font-black border transition-all ${
                mode===id ? "bg-[#1e293b] text-white border-[#1e293b]" : "bg-white text-[#4a6080] border-[#e2e8f0]"
              }`}>
              {id === "uniform" ? "منتظمة" : id === "accelerating" ? "متسارعة" : id === "decelerating" ? "متباطئة" : id === "changing" ? "سرعتان" : "ساكنة"}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
          <p className="text-[12px] font-bold text-[#4a6080]">حركة الجسم على مسار مستقيم (المقياس نفسه لرسم المسافة):</p>
          <svg viewBox="0 0 420 45" className="w-full h-auto" role="img" aria-label="موضع الجسم على المسار">
            <line x1="25" y1="25" x2="395" y2="25" stroke="#94a3b8" strokeWidth="3" />
            <circle cx={25 + getD(t) / 200 * 370} cy="25" r="8" fill={color} />
          </svg>
          <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full h-auto">
            <rect x={ML} y={MT} width={iw} height={ih} rx="12" fill="#f8fafc" stroke="#e2e8f0" />
            {[0,40,80,120,160,200].map(d=>(
              <g key={d}>
                <line x1={ML} y1={sy(d)} x2={CW-MR} y2={sy(d)} stroke="#e2e8f0" strokeDasharray="4 4" />
                <SvgTeX tex={String(d)} x={ML-43} y={sy(d)-9} width={32} height={18} align="end" color="#64748b" />
              </g>
            ))}
            {[0,2,4,6,8].map(s=>(
              <g key={s}>
                <line x1={sx(s)} y1={MT} x2={sx(s)} y2={CH-MB} stroke="#e2e8f0" strokeDasharray="4 4" />
                <SvgTeX tex={String(s)} x={sx(s)-12} y={CH-MB+9} width={24} height={18} color="#64748b" />
              </g>
            ))}
            <line x1={ML} y1={MT-8} x2={ML} y2={CH-MB+8} stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={ML-8} y1={CH-MB} x2={CW-MR+8} y2={CH-MB} stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            <SvgTeX tex="d(\mathrm{m})" x={ML-58} y={MT-22} width={54} height={20} align="end" color="var(--color-phys)" />
            <SvgTeX tex="t(\mathrm{s})" x={CW-MR+8} y={CH-MB+6} width={42} height={20} align="start" color="var(--color-phys)" />
            {pts.length > 1 && <polyline points={pts.map(p=>`${p.x},${p.y}`).join(" ")} fill="none" stroke={color} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />}
            {pts.length > 0 && <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="7" fill="white" stroke={color} strokeWidth="3" />}
          </svg>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button onClick={()=>{setT(0);setRunning(true);startTime.current=0;}} className="btn btn-phys !py-2 !text-[13px]">
            <Play className="h-4 w-4"/>ابدأ الحركة
          </button>
          <button onClick={()=>{setRunning(false);setT(0);startTime.current=0;}} className="btn btn-ghost !py-2 !text-[13px]">
            <RotateCcw className="h-4 w-4"/>تصفير
          </button>
          {running && (
            <button onClick={()=>setRunning(false)} className="btn btn-ghost !py-2 !text-[13px]">
              <Square className="h-4 w-4"/>إيقاف
            </button>
          )}
        </div>
      </div>

      {/* info panel */}
      <div className="space-y-4">
        <div className="rounded-2xl bg-white border border-[rgba(10,40,90,0.14)] p-5">
          <div className="mb-3 text-[14px] font-black text-[#0d1b2e]">القيم الحالية</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#4a6080]">الزمن:</span>
              <span className="font-black text-[#0066cc] text-[14px]">
                <TeX>{`t = ${t.toFixed(1)} \\text{ s}`}</TeX>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#4a6080]">المسافة:</span>
              <span className="font-black text-[14px]" style={{ color }}>
                <TeX>{`d = ${getD(t).toFixed(1)} \\text{ m}`}</TeX>
              </span>
            </div>
            {mode !== "stationary" && t > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#4a6080]">السرعة الوسطية:</span>
                <span className="font-black text-[#007a3d] text-[14px]">
                  <TeX>{`v_{avg} = ${(getD(t)/t).toFixed(1)} \\text{ m/s}`}</TeX>
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ background: `${color}18`, border: `1.5px solid ${color}44` }}>
          <div className="text-[13px] font-black mb-2" style={{ color }}>ماذا يقول الرسم البياني؟</div>
          <p className="text-[13px] font-bold leading-7 text-[#0d1b2e]">{summaries[mode]}</p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════ helpers ══════════════════ */
function drawBus(ctx: CanvasRenderingContext2D, x: number, floorY: number) {
  ctx.fillStyle = "#cc3300";
  ctx.beginPath();
  ctx.roundRect(x, floorY - 44, 150, 44, [12, 12, 0, 0]);
  ctx.fill();
  [[20,10,28,22],[56,10,28,22],[96,10,28,22]].forEach(([wx,wy,ww,wh])=>{
    ctx.fillStyle = "rgba(220,240,255,0.88)";
    ctx.beginPath(); ctx.roundRect(x+wx, floorY-44+wy, ww, wh, 4); ctx.fill();
  });
  ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(x+30, floorY, 10, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(x+118, floorY, 10, 0, Math.PI*2); ctx.fill();
}
function drawPerson(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, label: string) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y-14, 7, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x,y-7); ctx.lineTo(x,y+8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x-8,y); ctx.lineTo(x+8,y); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.font = "bold 10px Cairo, sans-serif";
  ctx.textAlign = "center"; ctx.fillText(label, x, y+22);
}
function drawTree(ctx: CanvasRenderingContext2D, x: number, floorY: number) {
  if (x < -40 || x > 700) return;
  ctx.fillStyle = "#5c3a1e";
  ctx.fillRect(x - 4, floorY - 50, 8, 50);
  ctx.fillStyle = "#2d7a3a";
  ctx.beginPath(); ctx.arc(x, floorY - 60, 24, 0, Math.PI * 2); ctx.fill();
}
