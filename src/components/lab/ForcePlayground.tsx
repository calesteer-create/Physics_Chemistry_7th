"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Gauge, Magnet, MoveHorizontal, RotateCcw } from "lucide-react";
import { TeX } from "@/components/math/TeX";

const TABS = [
  { id: "effect",  label: "أثر القوة",        icon: Magnet },
  { id: "vector",  label: "بنِ متجه القوة",    icon: MoveHorizontal },
  { id: "weight",  label: "الثقل والكتلة",     icon: Gauge },
] as const;
type Tab = (typeof TABS)[number]["id"];

/* ════════════════ wrapper ════════════════ */
export function ForcePlayground() {
  const [tab, setTab] = useState<Tab>("effect");
  return (
    <div className="lab-card overflow-hidden">
      <div className="bg-[#0d1b2e] px-6 py-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="eyebrow eyebrow-amber">مختبر القوة التفاعلي</span>
          <h3 className="text-[20px] font-black text-white">تجارب حية بالفيزياء</h3>
        </div>
        <p className="mt-1 text-[13px] leading-6 text-[var(--color-mist)]">
          ثلاث تجارب حيّة: أثر القوة في الحركة والشكل — بناء متجه القوة بعناصره الأربعة — العلاقة بين الثقل والكتلة وتأثير الجاذبية.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {TABS.map(t => {
            const I = t.icon;
            const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-black transition-all ${
                  on ? "bg-[#ffb03a] text-[#1c1000]" : "text-[var(--color-mist)] hover:text-white hover:bg-white/08"
                }`}>
                <I className="h-4 w-4" />{t.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="bg-[#060c1a] p-6">
        {tab === "effect"  && <ForceEffectLab />}
        {tab === "vector"  && <ForceVectorLab />}
        {tab === "weight"  && <WeightMassLab />}
      </div>
    </div>
  );
}

/* ════════════════ تجربة 1: أثر القوة ════════════════ */
function ForceEffectLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const [force, setForce] = useState(0); // 0 = no force, 1-5 = force level
  const [mode, setMode] = useState<"motion"|"shape">("motion");
  const bodyXRef = useRef(60);
  const velRef = useRef(0);
  const stretchRef = useRef(0);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    cv.width = 560; cv.height = 240;
    cv.style.width = "100%"; cv.style.height = "auto";
    bodyXRef.current = 60; velRef.current = 0; stretchRef.current = 0;

    function draw() {
      const cv = canvasRef.current; if (!cv) return;
      const ctx = cv.getContext("2d")!;
      const W = cv.width, H = cv.height;
      tRef.current += 1;
      ctx.clearRect(0, 0, W, H);
      // bg
      ctx.fillStyle = "#0a1628"; ctx.fillRect(0, 0, W, H);

      if (mode === "motion") {
        // apply force
        const acc = force * 0.4;
        velRef.current = Math.min(velRef.current + acc * 0.06, force * 2.8);
        bodyXRef.current += velRef.current;
        if (bodyXRef.current > W + 50) { bodyXRef.current = -50; velRef.current = 0; }

        // road
        ctx.fillStyle = "#1c2d44"; ctx.fillRect(0, H - 60, W, 60);
        ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.setLineDash([22, 16]); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, H - 30); ctx.lineTo(W, H - 30); ctx.stroke();
        ctx.setLineDash([]);

        // force arrow above car
        if (force > 0) {
          const ax = bodyXRef.current + 50, ay = H - 100;
          const arrowLen = 20 + force * 18;
          ctx.strokeStyle = "#ffb03a"; ctx.lineWidth = 4; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(ax - arrowLen, ay); ctx.lineTo(ax + 10, ay); ctx.stroke();
          ctx.fillStyle = "#ffb03a";
          ctx.beginPath(); ctx.moveTo(ax + 18, ay); ctx.lineTo(ax + 2, ay - 9); ctx.lineTo(ax + 2, ay + 9); ctx.fill();
          // F label
          ctx.fillStyle = "#ffb03a"; ctx.font = "bold 14px Cairo, sans-serif"; ctx.textAlign = "center";
          ctx.fillText(`F = ${force * 10} N`, ax - arrowLen / 2, ay - 10);
        }
        // car body
        const cx = bodyXRef.current;
        ctx.fillStyle = "#2563eb";
        ctx.beginPath(); ctx.roundRect(cx, H - 92, 100, 32, 10); ctx.fill();
        ctx.fillStyle = "#1d4ed8";
        ctx.beginPath(); ctx.roundRect(cx, H - 60, 100, 18, [0, 0, 10, 10]); ctx.fill();
        // windows
        ctx.fillStyle = "rgba(219,234,254,0.9)";
        ctx.fillRect(cx + 14, H - 88, 28, 16); ctx.fillRect(cx + 56, H - 88, 28, 16);
        // wheels
        [25, 75].forEach(dx => {
          ctx.fillStyle = "#0f172a";
          ctx.beginPath(); ctx.arc(cx + dx, H - 42, 11, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(cx + dx, H - 42, 11, 0, Math.PI * 2); ctx.stroke();
        });
        // speed label
        ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.font = "12px Cairo, sans-serif"; ctx.textAlign = "left";
        ctx.fillText(`سرعة: ${velRef.current.toFixed(1)} وحدة/ث`, 12, 24);

      } else {
        // SHAPE mode: spring
        ctx.fillStyle = "#334155";
        ctx.fillRect(W / 2 - 32, 20, 64, 20);
        // spring coils
        const coils = 6;
        const baseY = 40, maxStretch = 80;
        stretchRef.current = Math.min(stretchRef.current + force * 1.5, maxStretch);
        if (!force) stretchRef.current = Math.max(stretchRef.current - 3, 0);
        const springH = 60 + stretchRef.current;
        for (let i = 0; i < coils; i++) {
          const y1 = baseY + (i / coils) * springH;
          const y2 = baseY + ((i + 0.5) / coils) * springH;
          const y3 = baseY + ((i + 1) / coils) * springH;
          ctx.strokeStyle = "#60a5fa"; ctx.lineWidth = 4; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(W / 2, y1); ctx.quadraticCurveTo(W / 2 + 36, y2, W / 2, y3); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(W / 2, y1); ctx.quadraticCurveTo(W / 2 - 36, y2, W / 2, y3); ctx.stroke();
        }
        // weight
        const weightY = baseY + springH + 2;
        ctx.fillStyle = "#ffb03a";
        ctx.beginPath(); ctx.roundRect(W / 2 - 30, weightY, 60, 36, 10); ctx.fill();
        // force arrow on weight
        if (force > 0) {
          ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 5; ctx.lineCap = "round";
          const arrowLen = 20 + force * 20;
          ctx.beginPath(); ctx.moveTo(W / 2, weightY + 36); ctx.lineTo(W / 2, weightY + 36 + arrowLen); ctx.stroke();
          ctx.fillStyle = "#dc2626";
          ctx.beginPath(); ctx.moveTo(W / 2, weightY + 36 + arrowLen + 12); ctx.lineTo(W / 2 - 10, weightY + 36 + arrowLen); ctx.lineTo(W / 2 + 10, weightY + 36 + arrowLen); ctx.fill();
          ctx.fillStyle = "#fca5a5"; ctx.font = "13px Cairo, sans-serif"; ctx.textAlign = "center";
          ctx.fillText(`F = ${force * 10} N`, W / 2 + 55, weightY + 36 + arrowLen / 2);
        }
        // stretch indicator
        ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.font = "12px Cairo, sans-serif"; ctx.textAlign = "left";
        ctx.fillText(`الاستطالة: ${Math.round(stretchRef.current)} وحدة`, 12, H - 16);
      }
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [force, mode]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-4">
        <div className="flex gap-2">
          {[["motion","تغيير الحركة"],["shape","تغيير الشكل"]].map(([id,label]) => (
            <button key={id} onClick={() => { setMode(id as "motion"|"shape"); setForce(0); }}
              className={`flex-1 rounded-xl py-2.5 text-[13px] font-black border transition-all ${
                mode === id ? "bg-[var(--color-chem)] text-[#1c1000] border-[var(--color-chem)]"
                           : "border-[var(--color-line2)] text-[var(--color-mist)] hover:border-[var(--color-chem)]"
              }`}>{label}</button>
          ))}
        </div>
        <div className="lab-canvas"><canvas ref={canvasRef} /></div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-black text-[var(--color-mist)]">شدة القوة المطبّقة</span>
            <span className="text-[14px] font-black text-[var(--color-chem)]">
              <TeX>{`F = ${force * 10}\\,N`}</TeX>
            </span>
          </div>
          <input type="range" min={0} max={5} step={1} value={force}
            onChange={e => setForce(Number(e.target.value))} className="w-full accent-[var(--color-chem)]" />
          <div className="flex justify-between text-[11px] text-[var(--color-dim)]">
            {[0,10,20,30,40,50].map(v => <span key={v}>{v}N</span>)}
          </div>
        </div>
        <button onClick={() => { setForce(0); bodyXRef.current = 60; velRef.current = 0; stretchRef.current = 0; }}
          className="btn btn-ghost !py-2 !text-[12px] w-full">
          <RotateCcw className="h-4 w-4" />إعادة ضبط
        </button>
      </div>
      <div className="rounded-2xl border border-[rgba(255,176,58,0.2)] bg-[rgba(255,176,58,0.05)] p-5 text-[var(--color-fog)]">
        <h4 className="text-[16px] font-black text-[var(--color-chem)] mb-3">ماذا ألاحظ؟</h4>
        <ul className="space-y-3 text-[13.5px] font-bold leading-7">
          {mode === "motion" ? <>
            <li>• عند <TeX>{"F = 0"}</TeX>: السيارة ساكنة — لا قوة ولا حركة.</li>
            <li>• زيادة القوة تُسرّع السيارة: القوة تُغيّر الحالة الحركية للجسم.</li>
            <li>• الجسم لا يتحرك من نفسه، بل يحتاج قوة مؤثرة.</li>
          </> : <>
            <li>• عند <TeX>{"F = 0"}</TeX>: الربيعة بشكلها الطبيعي غير ممدودة.</li>
            <li>• زيادة القوة تمدّ الربيعة أكثر: القوة تُغيّر شكل الجسم.</li>
            <li>• الاستطالة تتناسب مع شدة القوة (قانون هوك).</li>
          </>}
          <li className="rounded-xl bg-[rgba(255,176,58,0.1)] border border-[rgba(255,176,58,0.2)] px-3 py-2">
            <span className="font-black text-[var(--color-chem)]">الخلاصة: </span>
            القوة = مؤثر يغيّر الحركة أو الشكل.
          </li>
        </ul>
      </div>
    </div>
  );
}

/* ════════════════ تجربة 2: بنِ متجه القوة ════════════════ */
function ForceVectorLab() {
  const [pointPos, setPointPos] = useState<"A"|"B">("A");
  const [angleDeg, setAngleDeg] = useState(0);
  const [magnitudeN, setMagnitudeN] = useState(30);
  const scale = 2.5; // px per N

  const W = 560, H = 260;
  const origins = { A: { x: 140, y: 160 }, B: { x: 420, y: 160 } };
  const origin = origins[pointPos];
  const rad = (angleDeg * Math.PI) / 180;
  const len = magnitudeN * scale;
  const ex = origin.x + Math.cos(rad) * len;
  const ey = origin.y - Math.sin(rad) * len;

  const arrowHead = (px: number, py: number, angle: number) => {
    const hlen = 16;
    const p1x = px - hlen * Math.cos(angle - 0.4);
    const p1y = py + hlen * Math.sin(angle - 0.4);
    const p2x = px - hlen * Math.cos(angle + 0.4);
    const p2y = py + hlen * Math.sin(angle + 0.4);
    return `${px},${py} ${p1x},${p1y} ${p2x},${p2y}`;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-4">
        <div className="rounded-2xl bg-[#0a1628] overflow-hidden">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {/* الحامل */}
            <line x1="20" y1={origin.y} x2={W - 20} y2={origin.y} stroke="#334155" strokeWidth="2.5" strokeDasharray="6 5" />
            {/* x x' */}
            <text x="12" y={origin.y - 6} fontSize="14" fill="#475569" fontWeight="bold">x′</text>
            <text x={W - 22} y={origin.y - 6} fontSize="14" fill="#475569" fontWeight="bold">x</text>
            {/* نقاط A و B */}
            {Object.entries(origins).map(([k, pos]) => (
              <g key={k}>
                <circle cx={pos.x} cy={pos.y} r="7" fill={pointPos === k ? "#ffb03a" : "#1e3a5f"} stroke="#334155" strokeWidth="2" />
                <text x={pos.x} y={pos.y + 24} textAnchor="middle" fontSize="13" fill="#94a3b8" fontWeight="800">{k}</text>
              </g>
            ))}
            {/* السهم */}
            <line x1={origin.x} y1={origin.y} x2={ex} y2={ey}
              stroke="#dc2626" strokeWidth="5" strokeLinecap="round" />
            <polygon points={arrowHead(ex, ey, Math.atan2(-(ey - origin.y), ex - origin.x))}
              fill="#dc2626" />
            {/* B label at tip */}
            <text x={ex + 10} y={ey - 8} fontSize="13" fill="#dc2626" fontWeight="800">B</text>
            {/* الشدة label */}
            <text x={(origin.x + ex) / 2 - 20} y={(origin.y + ey) / 2 - 12}
              fontSize="12" fill="#fca5a5" fontWeight="800">{magnitudeN} N</text>
            {/* arc for angle */}
            {angleDeg !== 0 && (
              <path d={`M${origin.x + 36},${origin.y} A36,36 0 0,${angleDeg > 0 ? "0" : "1"} ${origin.x + 36 * Math.cos(rad)},${origin.y - 36 * Math.sin(rad)}`}
                fill="none" stroke="#f59e0b" strokeWidth="2" />
            )}
            {angleDeg !== 0 && (
              <text x={origin.x + 46 * Math.cos(rad / 2)} y={origin.y - 46 * Math.sin(rad / 2)}
                fontSize="12" fill="#f59e0b" fontWeight="800">{angleDeg}°</text>
            )}
            {/* أنقطة شرح */}
            <text x={origin.x} y={origin.y - 20} textAnchor="middle" fontSize="11" fill="#94a3b8">O (نقطة التأثير)</text>
          </svg>
        </div>

        {/* Controls */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-[12px] font-black text-[var(--color-mist)]">نقطة التأثير</p>
            <div className="flex gap-2">
              {(["A","B"] as const).map(p => (
                <button key={p} onClick={() => setPointPos(p)}
                  className={`flex-1 rounded-xl py-2 text-[13px] font-black border transition-all ${
                    pointPos === p ? "bg-[var(--color-chem)] text-[#1c1000] border-[var(--color-chem)]"
                                 : "border-[var(--color-line2)] text-[var(--color-mist)]"
                  }`}>{p}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[12px] font-black text-[var(--color-mist)]">
              الشدة: <span className="text-white"><TeX>{`${magnitudeN}\\,N`}</TeX></span>
            </p>
            <input type="range" min={5} max={80} step={5} value={magnitudeN}
              onChange={e => setMagnitudeN(Number(e.target.value))} className="w-full accent-[#dc2626]" />
          </div>
        </div>
        <div>
          <p className="mb-2 text-[12px] font-black text-[var(--color-mist)]">
            الجهة (الزاوية مع الأفق): <span className="text-white">{angleDeg}°</span>
          </p>
          <input type="range" min={-90} max={90} step={15} value={angleDeg}
            onChange={e => setAngleDeg(Number(e.target.value))} className="w-full accent-[#f59e0b]" />
          <div className="flex justify-between text-[10px] text-[var(--color-dim)] mt-1">
            <span>−90°</span><span>−45°</span><span>0°</span><span>+45°</span><span>+90°</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[rgba(167,139,250,0.2)] bg-[rgba(167,139,250,0.05)] p-5">
        <h4 className="text-[16px] font-black text-[var(--color-vio)] mb-3">عناصر القوة الآن</h4>
        <div className="space-y-3 text-[13.5px] font-bold">
          <div className="flex items-start gap-3">
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#ffb03a]" />
            <div>
              <span className="text-[#ffb03a]">نقطة التأثير:</span>
              <span className="text-white mr-2">النقطة {pointPos}</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#64748b]" />
            <div>
              <span className="text-[#94a3b8]">الحامل:</span>
              <span className="text-white mr-2">المستقيم xx′</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#f59e0b]" />
            <div>
              <span className="text-[#f59e0b]">الجهة:</span>
              <span className="text-white mr-2">{angleDeg === 0 ? "أفقية نحو اليمين" : angleDeg > 0 ? `${angleDeg}° فوق الأفق` : `${-angleDeg}° تحت الأفق`}</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#dc2626]" />
            <div>
              <span className="text-[#f87171]">الشدة:</span>
              <span className="text-white mr-2"><TeX>{`${magnitudeN}\\,N`}</TeX></span>
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.2)] p-4 text-[13px] font-bold leading-7 text-[#ddd6fe]">
          غيّر نقطة التأثير → لاحظ كيف يتبدل موضع الشعاع. غيّر الجهة → يتغير اتجاه السهم. غيّر الشدة → يطول أو يقصر الشعاع.
        </div>
      </div>
    </div>
  );
}

/* ════════════════ تجربة 3: الثقل والكتلة ════════════════ */
const G_VALUES = { equator: 9.78, syria: 9.796, north_pole: 9.83, moon: 1.62, mars: 3.72 };
const G_LABELS: Record<string, string> = {
  equator: "خط الاستواء", syria: "سوريا", north_pole: "القطب الشمالي", moon: "سطح القمر", mars: "سطح المريخ"
};

function WeightMassLab() {
  const [mass, setMass] = useState(10);
  const [place, setPlace] = useState<keyof typeof G_VALUES>("syria");
  const g = G_VALUES[place];
  const w = Number((mass * g).toFixed(2));
  const maxW = mass * 9.83;
  const fillPct = Math.min((w / maxW) * 100, 100);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-black text-[var(--color-mist)]">كتلة الجسم</span>
            <span className="text-[15px] font-black text-white"><TeX>{`m = ${mass}\\,kg`}</TeX></span>
          </div>
          <input type="range" min={1} max={100} step={1} value={mass}
            onChange={e => setMass(Number(e.target.value))} className="w-full accent-[var(--color-phys)]" />
        </div>

        <div>
          <p className="text-[13px] font-black text-[var(--color-mist)] mb-2">المكان</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(G_LABELS).map(([id, label]) => (
              <button key={id} onClick={() => setPlace(id as keyof typeof G_VALUES)}
                className={`rounded-xl px-3 py-2 text-[12.5px] font-black border transition-all text-right ${
                  place === id ? "bg-[var(--color-chem)] text-[#1c1000] border-[var(--color-chem)]"
                              : "border-[var(--color-line2)] text-[var(--color-mist)] hover:border-[var(--color-chem)]"
                }`}>{label}</button>
            ))}
          </div>
        </div>

        {/* عداد الربيعة المرئي */}
        <div className="rounded-2xl bg-[#0a1628] p-4">
          <svg viewBox="0 0 200 320" className="mx-auto w-full max-w-[200px]">
            <defs>
              <linearGradient id="springGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f1f5f9" /><stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>
            </defs>
            {/* الحامل */}
            <rect x="68" y="12" width="64" height="18" rx="6" fill="#334155" />
            {/* الحبل */}
            <line x1="100" y1="30" x2="100" y2="58" stroke="#64748b" strokeWidth="4" />
            {/* الربيعة (أسطوانة + تدريجات) */}
            <rect x="74" y="58" width="52" height="148" rx="20" fill="url(#springGrad)" stroke="#94a3b8" strokeWidth="2" />
            {/* الخط الأحمر مؤشر */}
            <rect x="88" y={58 + 20 + (fillPct / 100) * 100} width="24" height="5" rx="2" fill="#dc2626" />
            {/* تدريجات */}
            {[0,2,4,6,8,10].map((v, i) => (
              <g key={v}>
                <line x1="118" y1={72 + i * 20} x2="128" y2={72 + i * 20} stroke="#94a3b8" strokeWidth="1.5" />
                <text x="132" y={76 + i * 20} fontSize="10" fill="#94a3b8" fontWeight="700">{v}</text>
              </g>
            ))}
            {/* الحبل السفلي والجسم */}
            <line x1="100" y1="206" x2="100" y2="234" stroke="#64748b" strokeWidth="4" />
            <rect x="72" y="234" width="56" height={Math.min(20 + mass * 0.4, 56)} rx="10" fill="#ffb03a" />
            {/* سهم الثقل */}
            <line x1="100" y1={290} x2="100" y2="308" stroke="#dc2626" strokeWidth="4" />
            <polygon points="100,316 92,302 108,302" fill="#dc2626" />
            <text x="118" y="308" fontSize="11" fill="#fca5a5" fontWeight="800">w</text>
          </svg>
        </div>
      </div>

      <div className="space-y-4">
        {/* نتائج */}
        <div className="card border-[rgba(255,176,58,0.3)] p-5">
          <h4 className="text-[15px] font-black text-[var(--color-chem)] mb-4">الحسابات الآنية</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--color-line)]">
              <span className="text-[13px] font-bold text-[var(--color-mist)]">الكتلة</span>
              <span className="text-[14px] font-black text-white"><TeX>{`m = ${mass}\\,kg`}</TeX></span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--color-line)]">
              <span className="text-[13px] font-bold text-[var(--color-mist)]">الجاذبية في {G_LABELS[place]}</span>
              <span className="text-[14px] font-black text-[#f59e0b]"><TeX>{`g = ${g}\\,N\\cdot kg^{-1}`}</TeX></span>
            </div>
            <div className="rounded-xl border border-[rgba(220,38,38,0.3)] bg-[rgba(220,38,38,0.08)] p-4 text-center">
              <div className="text-[13px] font-black text-[#f87171] mb-1"><TeX>{"w = m\\,g"}</TeX></div>
              <div className="text-[11px] text-[var(--color-dim)] mb-2">
                <TeX>{`w = ${mass} \\times ${g}`}</TeX>
              </div>
              <div className="text-[22px] font-black text-[#f87171]">
                <TeX>{`w = ${w}\\,N`}</TeX>
              </div>
            </div>
          </div>
        </div>

        {/* الفرق بين الكتلة والثقل */}
        <div className="rounded-2xl border border-[rgba(60,224,244,0.2)] bg-[rgba(60,224,244,0.05)] p-4">
          <h4 className="text-[14px] font-black text-[var(--color-phys)] mb-3">الفرق الجوهري</h4>
          <div className="space-y-2.5 text-[13px] font-bold leading-7">
            <div className="flex items-start gap-2">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-phys)]" />
              <span><span className="text-[var(--color-phys)]">الكتلة:</span> ثابتة (<TeX>{`${mass}\\,kg`}</TeX>) في كل مكان.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#dc2626]" />
              <span><span className="text-[#f87171]">الثقل:</span> يتغير حسب <TeX>{"g"}</TeX> في المكان.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#f59e0b]" />
              <span>على القمر: <TeX>{`w = ${(mass * 1.62).toFixed(1)}\\,N`}</TeX> فقط!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
