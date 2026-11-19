"use client";

import { useEffect, useRef, useState } from "react";
import { Gauge, Magnet, MoveHorizontal, RotateCcw } from "lucide-react";
import { AutoTex, SvgTeX, TeX } from "@/components/math/TeX";
import {
  carrierSegment, fittedVectorScale, nextPosition, nextVelocity,
  springElongationCm, vectorTip, weightArrowPx, weightSpringPx,
} from "./force-models";

const TABS = [
  { id: "effect", label: "أثر القوة", icon: Magnet },
  { id: "vector", label: "بنِ متجه القوة", icon: MoveHorizontal },
  { id: "weight", label: "الثقل والكتلة", icon: Gauge },
] as const;
type Tab = (typeof TABS)[number]["id"];

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
        {tab === "effect" && <ForceEffectLab />}
        {tab === "vector" && <ForceVectorLab />}
        {tab === "weight" && <WeightMassLab />}
      </div>
    </div>
  );
}

/* ════════════════ تجربة 1: أثر القوة (قصور ذاتي + استطالة توازنية) ════════════════ */
function ForceEffectLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const [force, setForce] = useState(0); // N
  const [friction, setFriction] = useState(0); // N
  const [mode, setMode] = useState<"motion" | "shape">("motion");
  const [readout, setReadout] = useState({ v: 0, net: 0 });
  const bodyXRef = useRef(60); // px
  const velRef = useRef(0); // m/s
  const forceRef = useRef(force);
  const frictionRef = useRef(friction);
  useEffect(() => { forceRef.current = force; }, [force]);
  useEffect(() => { frictionRef.current = friction; }, [friction]);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    cv.width = 560; cv.height = 240;
    let last = performance.now();
    let frame = 0;

    function draw(now: number) {
      const canvas = canvasRef.current; if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      const W = canvas.width, H = canvas.height;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0a1628"; ctx.fillRect(0, 0, W, H);
      const F = forceRef.current, Fr = frictionRef.current;

      if (mode === "motion") {
        velRef.current = nextVelocity(velRef.current, F, Fr, dt);
        bodyXRef.current = nextPosition(bodyXRef.current, velRef.current * 22, dt);
        if (bodyXRef.current > W + 60) bodyXRef.current = -110;
        if (bodyXRef.current < -120) bodyXRef.current = W + 50;
        const net = F === 0 && velRef.current === 0 ? 0 : F - (velRef.current > 0 ? Fr : 0);
        if ((frame++ & 7) === 0) setReadout({ v: velRef.current, net });

        ctx.fillStyle = "#1c2d44"; ctx.fillRect(0, H - 60, W, 60);
        ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.setLineDash([22, 16]); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, H - 30); ctx.lineTo(W, H - 30); ctx.stroke();
        ctx.setLineDash([]);

        const cx = bodyXRef.current;
        if (F > 0) {
          const ax = cx + 50, ay = H - 118;
          const arrowLen = 16 + F * 1.4;
          ctx.strokeStyle = "#ffb03a"; ctx.lineWidth = 4; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(ax - arrowLen, ay); ctx.lineTo(ax + 10, ay); ctx.stroke();
          ctx.fillStyle = "#ffb03a";
          ctx.beginPath(); ctx.moveTo(ax + 18, ay); ctx.lineTo(ax + 2, ay - 9); ctx.lineTo(ax + 2, ay + 9); ctx.fill();
          ctx.font = "bold 14px Cairo, sans-serif"; ctx.textAlign = "center";
          ctx.fillText(`F = ${F} N`, ax - arrowLen / 2, ay - 10);
        }
        if (Fr > 0 && velRef.current > 0.05) {
          const ay = H - 118;
          ctx.strokeStyle = "#f87171"; ctx.lineWidth = 4; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(cx + 50, ay); ctx.lineTo(cx + 50 - (16 + Fr * 1.4), ay); ctx.stroke();
          ctx.fillStyle = "#f87171";
          ctx.beginPath(); ctx.moveTo(cx + 42 - (16 + Fr * 1.4), ay); ctx.lineTo(cx + 58 - (16 + Fr * 1.4), ay - 9); ctx.lineTo(cx + 58 - (16 + Fr * 1.4), ay + 9); ctx.fill();
          ctx.font = "bold 12px Cairo, sans-serif"; ctx.textAlign = "center";
          ctx.fillText("احتكاك", cx + 30 - (16 + Fr * 1.4), ay - 10);
        }
        ctx.fillStyle = "#2563eb";
        ctx.beginPath(); ctx.roundRect(cx, H - 92, 100, 32, 10); ctx.fill();
        ctx.fillStyle = "#1d4ed8";
        ctx.beginPath(); ctx.roundRect(cx, H - 60, 100, 18, [0, 0, 10, 10]); ctx.fill();
        ctx.fillStyle = "rgba(219,234,254,0.9)";
        ctx.fillRect(cx + 14, H - 88, 28, 16); ctx.fillRect(cx + 56, H - 88, 28, 16);
        [25, 75].forEach(dx => {
          ctx.fillStyle = "#0f172a";
          ctx.beginPath(); ctx.arc(cx + dx, H - 42, 11, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(cx + dx, H - 42, 11, 0, Math.PI * 2); ctx.stroke();
        });
        ctx.fillStyle = "rgba(255,255,255,0.75)"; ctx.font = "12px Cairo, sans-serif"; ctx.textAlign = "left";
        ctx.fillText(`السرعة: ${velRef.current.toFixed(1)} m/s`, 12, 24);
        ctx.fillText(velRef.current > 0.05 && F === 0 && Fr === 0
          ? "لا قوة محصلة — تستمر الحركة بالسرعة نفسها (قصور ذاتي)"
          : "حرّك المنزلقات ولاحظ تغيّر السرعة", 12, 44);
      } else {
        const elongCm = springElongationCm(F);
        const springH = 52 + elongCm * 4;
        ctx.fillStyle = "#334155";
        ctx.fillRect(W / 2 - 32, 16, 64, 18);
        const coils = 6, baseY = 34;
        for (let i = 0; i < coils; i++) {
          const y1 = baseY + (i / coils) * springH;
          const y2 = baseY + ((i + 0.5) / coils) * springH;
          const y3 = baseY + ((i + 1) / coils) * springH;
          ctx.strokeStyle = "#60a5fa"; ctx.lineWidth = 4; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(W / 2, y1); ctx.quadraticCurveTo(W / 2 + 36, y2, W / 2, y3); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(W / 2, y1); ctx.quadraticCurveTo(W / 2 - 36, y2, W / 2, y3); ctx.stroke();
        }
        const weightY = baseY + springH + 2;
        ctx.fillStyle = "#ffb03a";
        ctx.beginPath(); ctx.roundRect(W / 2 - 30, weightY, 60, 34, 10); ctx.fill();
        ctx.fillStyle = "#0a1628"; ctx.font = "bold 11px Cairo, sans-serif"; ctx.textAlign = "center";
        ctx.fillText("جسم معلّق", W / 2, weightY + 21);
        if (F > 0) {
          const arrowLen = 14 + F * 0.7;
          ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 5; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(W / 2, weightY + 34); ctx.lineTo(W / 2, weightY + 34 + arrowLen); ctx.stroke();
          ctx.fillStyle = "#dc2626";
          ctx.beginPath(); ctx.moveTo(W / 2, weightY + 46 + arrowLen); ctx.lineTo(W / 2 - 10, weightY + 34 + arrowLen); ctx.lineTo(W / 2 + 10, weightY + 34 + arrowLen); ctx.fill();
          ctx.fillStyle = "#fca5a5"; ctx.font = "13px Cairo, sans-serif";
          ctx.fillText(`قوة الشدّ F = ${F} N`, W / 2 + 86, weightY + 34 + arrowLen / 2);
        }
        ctx.fillStyle = "rgba(255,255,255,0.65)"; ctx.font = "12px Cairo, sans-serif"; ctx.textAlign = "left";
        ctx.fillText(`الاستطالة: ${elongCm.toFixed(1)} cm`, 12, H - 14);
        ctx.fillText("زد القوة ولاحظ أن الاستطالة تستقر فورًا عند قيمة تتناسب معها", 12, 24);
      }
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame((t) => { last = t; draw(t); });
    return () => cancelAnimationFrame(rafRef.current);
  }, [mode]);

  const elong = springElongationCm(force);
  const graphPts = [0, 10, 20, 30, 40, 50].map(f => `${20 + f * 1.6},${86 - springElongationCm(f) * 7}`).join(" ");

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-4">
        <div className="flex gap-2">
          {[["motion", "تغيير الحركة"], ["shape", "تغيير الشكل"]].map(([id, label]) => (
            <button key={id} onClick={() => { setMode(id as "motion" | "shape"); setForce(0); setFriction(0); velRef.current = 0; bodyXRef.current = 60; }}
              className={`flex-1 rounded-xl py-2.5 text-[13px] font-black border transition-all ${
                mode === id ? "bg-[var(--color-chem)] text-[#1c1000] border-[var(--color-chem)]"
                           : "border-[var(--color-line2)] text-[var(--color-mist)] hover:border-[var(--color-chem)]"
              }`}>{label}</button>
          ))}
        </div>
        <div className="lab-canvas overflow-x-auto">
          <div className="min-w-[540px]">
            <canvas ref={canvasRef} role="img" aria-label={mode === "motion" ? "محاكاة سيارة تتحرك بتأثير قوة دفع واحتكاك" : "محاكاة ربيعة تستطيل بتأثير قوة شد"} style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-black text-[var(--color-mist)]">{mode === "motion" ? "قوة الدفع المطبّقة" : "قوة الشدّ المطبّقة"}</span>
            <span className="text-[14px] font-black text-[var(--color-chem)]"><TeX>{`F = ${force}\\,N`}</TeX></span>
          </div>
          <input type="range" min={0} max={50} step={5} value={force} aria-label="شدة القوة المطبقة بالنيوتن"
            onChange={e => setForce(Number(e.target.value))} className="w-full accent-[var(--color-chem)]" />
          <div className="flex justify-between text-[11px] text-[var(--color-dim)]">{[0, 10, 20, 30, 40, 50].map(v => <span key={v}><AutoTex text={`${v}N`} /></span>)}</div>
        </div>
        {mode === "motion" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-black text-[var(--color-mist)]">قوة الاحتكاك المعاكسة</span>
              <span className="text-[14px] font-black text-[#f87171]"><TeX>{`${friction}\\,N`}</TeX></span>
            </div>
            <input type="range" min={0} max={20} step={2} value={friction} aria-label="شدة قوة الاحتكاك بالنيوتن"
              onChange={e => setFriction(Number(e.target.value))} className="w-full accent-[#dc2626]" />
            <p className="text-[11.5px] font-bold text-[var(--color-dim)]">جرّب: ادفع السيارة ثم أعد قوة الدفع إلى الصفر ولاحظ الفرق بين وجود الاحتكاك وغيابه.</p>
          </div>
        )}
        <button onClick={() => { setForce(0); setFriction(0); bodyXRef.current = 60; velRef.current = 0; setReadout({ v: 0, net: 0 }); }}
          className="btn btn-ghost !py-2 !text-[12px] w-full">
          <RotateCcw className="h-4 w-4" />إعادة ضبط
        </button>
      </div>
      <div className="rounded-2xl border border-[rgba(255,176,58,0.2)] bg-[rgba(255,176,58,0.05)] p-5 text-[var(--color-fog)]">
        <h4 className="text-[16px] font-black text-[var(--color-chem)] mb-3">ماذا ألاحظ؟</h4>
        {mode === "motion" ? (
          <ul className="space-y-3 text-[13.5px] font-bold leading-7">
            <li>• السيارة الساكنة لا تبدأ الحركة إلا بقوة دفع أكبر من الاحتكاك الساكن.</li>
            <li>• أعد الدفع إلى <TeX>{"F = 0"}</TeX> دون احتكاك: <b>تستمر السيارة بالسرعة نفسها</b> — الجسم المتحرك لا يحتاج قوة ليستمر، بل يحتاج قوة محصلة ليتسارع أو يتباطأ أو يغيّر اتجاهه (القصور الذاتي).</li>
            <li>• فعّل الاحتكاك ثم توقّف عن الدفع: تتباطأ السيارة حتى تقف. الذي أوقفها قوة الاحتكاك المعاكسة، لا «غياب الدفع».</li>
            <li>• السرعة الآن: <TeX>{`${readout.v.toFixed(1)}\\,\\text{m/s}`}</TeX></li>
            <li className="rounded-xl bg-[rgba(255,176,58,0.1)] border border-[rgba(255,176,58,0.2)] px-3 py-2">
              <span className="font-black text-[var(--color-chem)]">تصوّر خاطئ شائع: </span>
              «القوة وقود الحركة فإذا انتهت وقفت الحركة» — الصحيح أن القوة تغيّر الحركة؛ والاحتكاك هو ما يوقف أجسامنا اليومية غالبًا.
            </li>
          </ul>
        ) : (
          <div className="space-y-3 text-[13.5px] font-bold leading-7">
            <p>• عند <TeX>{"F = 0"}</TeX> تعود الربيعة إلى طولها الطبيعي.</p>
            <p>• الاستطالة التوازنية الحالية: <TeX>{`\\Delta L = ${elong.toFixed(1)}\\,\\text{cm}`}</TeX> عند <TeX>{`F = ${force}\\,N`}</TeX>. ضاعف القوة تلاحظ مضاعفة الاستطالة: ضمن حدود مرونة الربيعة تتناسب الاستطالة طردًا مع القوة المطبّقة.</p>
            <svg viewBox="0 0 120 96" className="w-full max-w-[220px]" role="img" aria-label="رسم بياني يوضح تناسب الاستطالة مع القوة">
              <line x1="20" y1="86" x2="108" y2="86" stroke="#64748b" strokeWidth="1.5" />
              <line x1="20" y1="86" x2="20" y2="8" stroke="#64748b" strokeWidth="1.5" />
              <polyline points={graphPts} fill="none" stroke="#ffb03a" strokeWidth="2.5" />
              <circle cx={20 + force * 1.6} cy={86 - elong * 7} r="4" fill="#dc2626" />
              <SvgTeX tex="F\,(\text{N})" x={44} y={84} width={40} height={14} align="middle" color="#94a3b8" fontSize="8px" />
              <SvgTeX tex="\Delta L" x={4} y={10} width={34} height={14} color="#94a3b8" fontSize="8px" />
            </svg>
            <table className="w-full text-center text-[12px]">
              <thead><tr><th className="py-1"><AutoTex text="F (N)" /></th>{[10, 20, 30, 40, 50].map(v => <td key={v}>{v}</td>)}</tr></thead>
              <tbody><tr><th className="py-1"><AutoTex text="ΔL (cm)" /></th>{[10, 20, 30, 40, 50].map(v => <td key={v}>{springElongationCm(v).toFixed(0)}</td>)}</tr></tbody>
            </table>
            <p className="rounded-xl bg-[rgba(255,176,58,0.1)] border border-[rgba(255,176,58,0.2)] px-3 py-2">
              <span className="font-black text-[var(--color-chem)]">الخلاصة: </span>
              القوة مؤثر يغيّر الحركة أو الشكل؛ والاستطالة هنا مقياس لشدة القوة كما في ميزان الربيعة.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════ تجربة 2: بنِ متجه القوة ════════════════ */
function ForceVectorLab() {
  const [pointPos, setPointPos] = useState<"A" | "B">("A");
  const [angleDeg, setAngleDeg] = useState(0);
  const [magnitudeN, setMagnitudeN] = useState(30);

  const W = 560, H = 260, PAD = 30;
  const origins = { A: { x: 140, y: 160 }, B: { x: 420, y: 160 } };
  const origin = origins[pointPos];
  const scale = fittedVectorScale(origin, magnitudeN, angleDeg, W, H, PAD, 2.5);
  const tip = vectorTip(origin, magnitudeN, angleDeg, scale);
  const carrier = carrierSegment(origin, angleDeg, W, H, 16);
  const rad = (angleDeg * Math.PI) / 180;
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, hi));
  const tipLabelX = clamp(tip.x + 10, 8, W - 92);
  const tipLabelY = clamp(tip.y - 10, 14, H - 8);

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
        <div className="rounded-2xl bg-[#0a1628] overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto min-w-[480px] w-full" role="img" aria-label="بناء متجه قوة بنقطة تأثير وحامل وجهة وشدة قابلة للتغيير">
            <line x1={carrier.x1} y1={carrier.y1} x2={carrier.x2} y2={carrier.y2} stroke="#64748b" strokeWidth="2.5" strokeDasharray="6 5" />
            {Object.entries(origins).map(([k, pos]) => (
              <g key={k}>
                <circle cx={pos.x} cy={pos.y} r="7" fill={pointPos === k ? "#ffb03a" : "#1e3a5f"} stroke="#334155" strokeWidth="2" />
                <SvgTeX tex={k} x={pos.x - 12} y={pos.y + 12} width={24} height={18} align="middle" color="#94a3b8" fontSize="13px" />
              </g>
            ))}
            <line x1={origin.x} y1={origin.y} x2={tip.x} y2={tip.y} stroke="#dc2626" strokeWidth="5" strokeLinecap="round" />
            <polygon points={arrowHead(tip.x, tip.y, Math.atan2(-(tip.y - origin.y), tip.x - origin.x))} fill="#dc2626" />
            <text x={tipLabelX} y={tipLabelY} fontSize="12" fill="#fca5a5" fontWeight="800">رأس الشعاع</text>
            <SvgTeX tex={`${magnitudeN}\\,\\text{N}`} x={(origin.x + tip.x) / 2 - 24} y={clamp((origin.y + tip.y) / 2 - 18, 8, H - 14)} width={64} height={18} color="#fca5a5" fontSize="12px" />
            {angleDeg !== 0 && (
              <path d={`M${origin.x + 36},${origin.y} A36,36 0 0,${angleDeg > 0 ? "0" : "1"} ${origin.x + 36 * Math.cos(rad)},${origin.y - 36 * Math.sin(rad)}`} fill="none" stroke="#f59e0b" strokeWidth="2" />
            )}
            {angleDeg !== 0 && (
              <SvgTeX tex={`${angleDeg}^\\circ`} x={clamp(origin.x + 48 * Math.cos(rad / 2), 8, W - 40)} y={clamp(origin.y - 48 * Math.sin(rad / 2) - 6, 8, H - 14)} width={44} height={18} color="#f59e0b" fontSize="12px" />
            )}
            <text x={origin.x} y={clamp(origin.y - 20, 14, H - 8)} textAnchor="middle" fontSize="11" fill="#94a3b8">{pointPos} (نقطة التأثير)</text>
          </svg>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-[12px] font-black text-[var(--color-mist)]">نقطة التأثير</p>
            <div className="flex gap-2">
              {(["A", "B"] as const).map(p => (
                <button key={p} onClick={() => setPointPos(p)}
                  className={`flex-1 rounded-xl py-2 text-[13px] font-black border transition-all ${
                    pointPos === p ? "bg-[var(--color-chem)] text-[#1c1000] border-[var(--color-chem)]" : "border-[var(--color-line2)] text-[var(--color-mist)]"
                  }`}>{p}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[12px] font-black text-[var(--color-mist)]">الشدة: <span className="text-white"><TeX>{`${magnitudeN}\\,N`}</TeX></span></p>
            <input type="range" min={5} max={80} step={5} value={magnitudeN} aria-label="شدة القوة بالنيوتن" onChange={e => setMagnitudeN(Number(e.target.value))} className="w-full accent-[#dc2626]" />
          </div>
        </div>
        <div>
          <p className="mb-2 text-[12px] font-black text-[var(--color-mist)]">الجهة (الزاوية مع الأفق): <span className="text-white"><AutoTex text={`${angleDeg}°`} /></span></p>
          <input type="range" min={-90} max={90} step={15} value={angleDeg} aria-label="زاوية جهة القوة مع الأفق" onChange={e => setAngleDeg(Number(e.target.value))} className="w-full accent-[#f59e0b]" />
          <div className="flex justify-between text-[10px] text-[var(--color-dim)] mt-1">{["−90°", "−45°", "0°", "+45°", "+90°"].map(t => <span key={t}><AutoTex text={t} /></span>)}</div>
          <p className="mt-1 text-[11px] font-bold text-[var(--color-dim)]">عند الشدات والزوايا الكبيرة يُصغَّر مقياس الرسم تلقائيًا كي يبقى السهم كاملًا داخل الإطار.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[rgba(167,139,250,0.2)] bg-[rgba(167,139,250,0.05)] p-5">
        <h4 className="text-[16px] font-black text-[var(--color-vio)] mb-3">عناصر القوة الآن</h4>
        <div className="space-y-3 text-[13.5px] font-bold">
          <div className="flex items-start gap-3"><span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#ffb03a]" /><div><span className="text-[#ffb03a]">نقطة التأثير:</span><span className="text-white mr-2">النقطة {pointPos}</span></div></div>
          <div className="flex items-start gap-3"><span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#64748b]" /><div><span className="text-[#94a3b8]">الحامل:</span><span className="text-white mr-2">المستقيم المار بالنقطة {pointPos} وباتجاه القوة نفسه (يدور معها)</span></div></div>
          <div className="flex items-start gap-3"><span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#f59e0b]" /><div><span className="text-[#f59e0b]">الجهة:</span><span className="text-white mr-2"><AutoTex text={angleDeg === 0 ? "أفقية نحو اليمين" : angleDeg > 0 ? `${angleDeg}° فوق الأفق` : `${-angleDeg}° تحت الأفق`} /></span></div></div>
          <div className="flex items-start gap-3"><span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#dc2626]" /><div><span className="text-[#f87171]">الشدة:</span><span className="text-white mr-2"><TeX>{`${magnitudeN}\\,N`}</TeX> (المقياس الحالي <TeX>{`${scale.toFixed(1)}\\,\\text{px/N}`}</TeX>)</span></div></div>
        </div>
        <div className="mt-4 rounded-xl bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.2)] p-4 text-[13px] font-bold leading-7 text-[#ddd6fe]">
          لاحظ: الحامل ليس خطًا أفقيًا ثابتًا؛ إنه المستقيم الذي تقع عليه القوة نفسها. غيّر الزاوية يلاحظ دوران الحامل مع السهم، وغيّر الشدة يطول الشعاع أو يقصر على الحامل نفسه.
        </div>
      </div>
    </div>
  );
}

/* ════════════════ تجربة 3: الثقل والكتلة (ميزان ربيعة يستجيب فعليًا) ════════════════ */
const G_VALUES = { equator: 9.78, syria: 9.796, north_pole: 9.83, moon: 1.62, mars: 3.72 };
const G_LABELS: Record<string, string> = {
  equator: "خط الاستواء", syria: "سوريا", north_pole: "القطب الشمالي", moon: "سطح القمر", mars: "سطح المريخ",
};

function WeightMassLab() {
  const [mass, setMass] = useState(10);
  const [place, setPlace] = useState<keyof typeof G_VALUES>("syria");
  const g = G_VALUES[place];
  const w = Number((mass * g).toFixed(2));
  const maxScaleN = Math.max(50, Math.ceil((mass * 9.83) / 50) * 50);
  const pointerPct = Math.min(w / maxScaleN, 1);
  const stretchPx = weightSpringPx(w);
  const arrowPx = weightArrowPx(w);
  const springTop = 64, springBase = 34;
  const springBottom = springTop + springBase + stretchPx;
  const bodyH = Math.min(22 + mass * 0.32, 54);
  const bodyY = 262;
  const svgH = bodyY + bodyH + arrowPx + 34;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-black text-[var(--color-mist)]">كتلة الجسم</span>
            <span className="text-[15px] font-black text-white"><TeX>{`m = ${mass}\\,kg`}</TeX></span>
          </div>
          <input type="range" min={1} max={100} step={1} value={mass} aria-label="كتلة الجسم بالكيلوغرام" onChange={e => setMass(Number(e.target.value))} className="w-full accent-[var(--color-phys)]" />
        </div>

        <div>
          <p className="text-[13px] font-black text-[var(--color-mist)] mb-2">المكان</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(G_LABELS).map(([id, label]) => (
              <button key={id} onClick={() => setPlace(id as keyof typeof G_VALUES)}
                className={`rounded-xl px-3 py-2 text-[12.5px] font-black border transition-all text-right ${
                  place === id ? "bg-[var(--color-chem)] text-[#1c1000] border-[var(--color-chem)]" : "border-[var(--color-line2)] text-[var(--color-mist)] hover:border-[var(--color-chem)]"
                }`}>{label}</button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-[#0a1628] p-4 overflow-x-auto">
          <svg viewBox={`0 0 220 ${svgH}`} className="mx-auto w-full min-w-[190px] max-w-[230px]" role="img" aria-label={`ميزان ربيعة يقيس ثقلًا قدره ${w} نيوتن`}>
            <rect x="76" y="10" width="68" height="18" rx="6" fill="#334155" />
            <line x1="110" y1="28" x2="110" y2={springTop} stroke="#64748b" strokeWidth="4" />
            <rect x="82" y="44" width="56" height="212" rx="18" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
            {[0, 0.25, 0.5, 0.75, 1].map(f => {
              const y = 66 + f * 168;
              const val = Math.round(maxScaleN * f);
              return (
                <g key={f}>
                  <line x1="124" y1={y} x2="136" y2={y} stroke="#64748b" strokeWidth="1.5" />
                  <SvgTeX tex={`${val}\\,\\text{N}`} x={140} y={y - 7} width={44} height={16} color="#475569" fontSize="9px" />
                </g>
              );
            })}
            {/* ملفات ربيعة تستطيل مع الثقل */}
            {Array.from({ length: 6 }, (_, i) => {
              const seg = (springBase + stretchPx) / 6;
              const y = springTop + i * seg;
              const dir = i % 2 === 0 ? 1 : -1;
              return <path key={i} d={`M110,${y} Q${110 + dir * 15},${y + seg / 2} 110,${y + seg}`} fill="none" stroke="#3b6cb5" strokeWidth="3" strokeLinecap="round" />;
            })}
            <line x1="92" y1={66 + pointerPct * 168} x2="128" y2={66 + pointerPct * 168} stroke="#dc2626" strokeWidth="4" />
            <line x1="110" y1={springBottom} x2="110" y2={bodyY} stroke="#64748b" strokeWidth="4" />
            <rect x={110 - (24 + mass * 0.14)} y={bodyY} width={48 + mass * 0.28} height={bodyH} rx="10" fill="#ffb03a" />
            <line x1="110" y1={bodyY + bodyH + 4} x2="110" y2={bodyY + bodyH + 4 + Math.max(arrowPx - 10, 0)} stroke="#dc2626" strokeWidth="4" />
            <polygon points={`110,${bodyY + bodyH + 4 + arrowPx} 102,${bodyY + bodyH + 4 + Math.max(arrowPx - 10, 0)} 118,${bodyY + bodyH + 4 + Math.max(arrowPx - 10, 0)}`} fill="#dc2626" />
            <SvgTeX tex={`w = ${w}\\,\\text{N}`} x={122} y={bodyY + bodyH + 6 + arrowPx / 2} width={70} height={18} color="#fca5a5" fontSize="11px" />
          </svg>
          <p className="mt-2 text-center text-[11.5px] font-bold text-[var(--color-dim)]">لاحظ: الربيعة نفسها تستطيل أكثر كلما ازداد الثقل، ويقصر سهم الثقل على القمر رغم بقاء الكتلة نفسها.</p>
        </div>
      </div>

      <div className="space-y-4">
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
              <div className="text-[11px] text-[var(--color-dim)] mb-2"><TeX>{`w = ${mass} \\times ${g}`}</TeX></div>
              <div className="text-[22px] font-black text-[#f87171]"><TeX>{`w = ${w}\\,N`}</TeX></div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[rgba(60,224,244,0.2)] bg-[rgba(60,224,244,0.05)] p-4">
          <h4 className="text-[14px] font-black text-[var(--color-phys)] mb-3">الفرق الجوهري</h4>
          <div className="space-y-2.5 text-[13px] font-bold leading-7">
            <div className="flex items-start gap-2"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-phys)]" /><span><span className="text-[var(--color-phys)]">الكتلة:</span> ثابتة (<TeX>{`${mass}\\,kg`}</TeX>) في كل مكان — جرّب تغيير المكان وحده ولاحظ ثباتها بينما تتحرك قراءة الربيعة.</span></div>
            <div className="flex items-start gap-2"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#dc2626]" /><span><span className="text-[#f87171]">الثقل:</span> يتغير حسب <TeX>{"g"}</TeX> في المكان وحسب الكتلة معًا، فتتغير معه استطالة الربيعة وطول السهم.</span></div>
            <div className="flex items-start gap-2"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#f59e0b]" /><span>على القمر بالكتلة الحالية: <TeX>{`w = ${(mass * 1.62).toFixed(1)}\\,N`}</TeX> فقط!</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
