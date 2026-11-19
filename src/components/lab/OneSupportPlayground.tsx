"use client";

import { useMemo, useState } from "react";
import { Play, Rocket, RotateCcw, Sigma, Split } from "lucide-react";
import { SvgTeX, TeX } from "@/components/math/TeX";

const TABS = [
  { id: "same", label: "الجمع على نفس الجهة", icon: Sigma },
  { id: "opposite", label: "الطرح مع جهتين متعاكستين", icon: Split },
  { id: "action", label: "الفعل ورد الفعل", icon: Rocket },
] as const;

type Tab = (typeof TABS)[number]["id"];

export function OneSupportPlayground() {
  const [tab, setTab] = useState<Tab>("same");
  return (
    <div className="lab-card overflow-hidden">
      <div className="bg-[#0d1b2e] px-6 py-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="eyebrow eyebrow-amber">مختبر القوى على حامل واحد</span>
          <h3 className="text-[20px] font-black text-white">ابنِ المحصلة بنفسك</h3>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {TABS.map(t => {
            const I = t.icon;
            const on = tab === t.id;
            return <button key={t.id} onClick={()=>setTab(t.id)} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-black ${on?"bg-[#ffb03a] text-[#1c1000]":"text-[var(--color-mist)] hover:text-white hover:bg-white/08"}`}><I className="h-4 w-4" />{t.label}</button>;
          })}
        </div>
      </div>
      <div className="bg-[#060c1a] p-6">
        {tab === "same" && <SameDirectionLab />}
        {tab === "opposite" && <OppositeDirectionLab />}
        {tab === "action" && <ActionReactionLab />}
      </div>
    </div>
  );
}

function SameDirectionLab() {
  const [f1, setF1] = useState(20);
  const [f2, setF2] = useState(30);
  const F = f1 + f2;
  const px = 4;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="rounded-2xl bg-[rgba(6,14,30,0.55)] p-5">
        <svg viewBox="0 0 540 240" className="w-full h-auto">
          <line x1="40" y1="120" x2="500" y2="120" stroke="#64748b" strokeDasharray="6 5" strokeWidth="2" />
          <circle cx="80" cy="120" r="6" fill="#fff" stroke="#24304a" strokeWidth="2" />
          <SvgTeX tex="O" x={66} y={84} width={22} height={18} color="#c96a4f" fontSize="14px" />
          <line x1="80" y1="120" x2={80 + f1*px} y2="120" stroke="#f2b632" strokeWidth="5" strokeLinecap="round" />
          <polygon points={`${80 + f1*px},120 ${80 + f1*px - 14},112 ${80 + f1*px - 14},128`} fill="#f2b632" />
          <SvgTeX tex="F_1" x={110} y={80} width={34} height={20} color="#f2b632" fontSize="15px" />
          <line x1="80" y1="120" x2={80 + f2*px} y2="120" stroke="#4aa9df" strokeWidth="5" strokeLinecap="round" />
          <polygon points={`${80 + f2*px},120 ${80 + f2*px - 14},112 ${80 + f2*px - 14},128`} fill="#4aa9df" />
          <SvgTeX tex="F_2" x={150} y={80} width={34} height={20} color="#4aa9df" fontSize="15px" />
          <line x1="80" y1="120" x2={80 + F*px} y2="120" stroke="#c4634a" strokeWidth="6.5" strokeLinecap="round" />
          <polygon points={`${80 + F*px},120 ${80 + F*px - 18},110 ${80 + F*px - 18},130`} fill="#c4634a" />
          <SvgTeX tex="F" x={220} y={80} width={26} height={20} color="#c4634a" fontSize="15px" />
        </svg>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <p className="mb-2 text-[12px] font-black text-[var(--color-mist)]"><TeX>{"F_1 = " + f1 + "\\,N"}</TeX></p>
            <input type="range" min={0} max={80} step={5} value={f1} onChange={e=>setF1(Number(e.target.value))} className="w-full accent-[#f2b632]" />
          </div>
          <div>
            <p className="mb-2 text-[12px] font-black text-[var(--color-mist)]"><TeX>{"F_2 = " + f2 + "\\,N"}</TeX></p>
            <input type="range" min={0} max={80} step={5} value={f2} onChange={e=>setF2(Number(e.target.value))} className="w-full accent-[#4aa9df]" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-[rgba(255,176,58,0.2)] bg-[rgba(255,176,58,0.06)] p-5">
          <h4 className="text-[15px] font-black text-[var(--color-chem)] mb-3">النتيجة</h4>
          <div className="text-[14px] font-bold leading-8 text-white"><TeX>{`F = F_1 + F_2 = ${f1} + ${f2} = ${F}\\,N`}</TeX></div>
          <p className="mt-3 text-[13px] font-bold leading-7 text-[#ffe4b8]">لأن القوتين في الجهة نفسها، فإنهما تتعاونان وتكون المحصلة أكبر منهما.</p>
        </div>
      </div>
    </div>
  );
}

function OppositeDirectionLab() {
  const [f1, setF1] = useState(20);
  const [f2, setF2] = useState(35);
  const bigger = f1 >= f2 ? "F1" : "F2";
  const F = Math.abs(f2 - f1);
  const px = 4;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="rounded-2xl bg-[rgba(6,14,30,0.55)] p-5">
        <svg viewBox="0 0 560 240" className="w-full h-auto">
          <line x1="50" y1="120" x2="510" y2="120" stroke="#64748b" strokeDasharray="6 5" strokeWidth="2" />
          <circle cx="240" cy="120" r="6" fill="#fff" stroke="#24304a" strokeWidth="2" />
          <SvgTeX tex="O" x={226} y={84} width={22} height={18} color="#c4634a" fontSize="14px" />
          <line x1="240" y1="120" x2={240 - f1*px} y2="120" stroke="#f2b632" strokeWidth="5" strokeLinecap="round" />
          <polygon points={`${240 - f1*px},120 ${240 - f1*px + 14},112 ${240 - f1*px + 14},128`} fill="#f2b632" />
          <SvgTeX tex="F_1" x={240 - f1*px + 10} y={80} width={34} height={20} color="#f2b632" fontSize="15px" />
          <line x1="240" y1="120" x2={240 + f2*px} y2="120" stroke="#c4634a" strokeWidth="6" strokeLinecap="round" />
          <polygon points={`${240 + f2*px},120 ${240 + f2*px - 14},112 ${240 + f2*px - 14},128`} fill="#c4634a" />
          <SvgTeX tex="F_2" x={240 + f2*px - 18} y={80} width={34} height={20} color="#c4634a" fontSize="15px" />
          {F > 0 && bigger === "F2" && (
            <>
              <line x1="240" y1="152" x2={240 + F*px} y2="152" stroke="#4aa9df" strokeWidth="5" strokeLinecap="round" />
              <polygon points={`${240 + F*px},152 ${240 + F*px - 14},144 ${240 + F*px - 14},160`} fill="#4aa9df" />
              <SvgTeX tex="F" x={240 + F*px/2 - 13} y={163} width={26} height={20} color="#4aa9df" fontSize="15px" />
            </>
          )}
          {F > 0 && bigger === "F1" && (
            <>
              <line x1="240" y1="152" x2={240 - F*px} y2="152" stroke="#4aa9df" strokeWidth="5" strokeLinecap="round" />
              <polygon points={`${240 - F*px},152 ${240 - F*px + 14},144 ${240 - F*px + 14},160`} fill="#4aa9df" />
              <SvgTeX tex="F" x={240 - F*px/2 - 13} y={163} width={26} height={20} color="#4aa9df" fontSize="15px" />
            </>
          )}
        </svg>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div><p className="mb-2 text-[12px] font-black text-[var(--color-mist)]"><TeX>{"F_1 = " + f1 + "\\,N"}</TeX></p><input type="range" min={0} max={80} step={5} value={f1} onChange={e=>setF1(Number(e.target.value))} className="w-full accent-[#f2b632]" /></div>
          <div><p className="mb-2 text-[12px] font-black text-[var(--color-mist)]"><TeX>{"F_2 = " + f2 + "\\,N"}</TeX></p><input type="range" min={0} max={80} step={5} value={f2} onChange={e=>setF2(Number(e.target.value))} className="w-full accent-[#c4634a]" /></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-[rgba(167,139,250,0.2)] bg-[rgba(167,139,250,0.06)] p-5">
          <h4 className="text-[15px] font-black text-[var(--color-vio)] mb-3">النتيجة</h4>
          <div className="text-[14px] font-bold leading-8 text-white"><TeX>{`F = |F_2 - F_1| = |${f2}-${f1}| = ${F}\\,N`}</TeX></div>
          <p className="mt-3 text-[13px] font-bold leading-7 text-[#ddd6fe]">{F === 0 ? "القوتان متساويتان ومتعاكستان، لذا المحصلة صفر." : `جهة المحصلة هي جهة القوة الأكبر (${bigger}).`}</p>
        </div>
      </div>
    </div>
  );
}

function ActionReactionLab() {
  const [air, setAir] = useState(60);
  const [released, setReleased] = useState(false);
  const [x, setX] = useState(60);
  const [jetLen, setJetLen] = useState(air);

  // simple animation tick
  function step() {
    if (!released) return;
    setX(v => Math.min(v + Math.max(1, air / 10), 360));
    setJetLen(v => Math.max(0, v - 6));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="rounded-2xl bg-[rgba(6,14,30,0.55)] p-5">
        <svg viewBox="0 0 520 220" className="w-full h-auto">
          <line x1="30" y1="40" x2="490" y2="40" stroke="#94a3b8" strokeWidth="3" />
          <circle cx="30" cy="40" r="4" fill="#94a3b8" /><circle cx="490" cy="40" r="4" fill="#94a3b8" />
          <g transform={`translate(${x},70)`}>
            <ellipse cx="0" cy="42" rx="34" ry="44" fill="#ef4444" />
            <rect x="-6" y="76" width="12" height="18" rx="3" fill="#b91c1c" />
          </g>
          {released && jetLen > 0 && (
            <>
              <line x1={x} y1="164" x2={x} y2={164 + jetLen} stroke="#60a5fa" strokeWidth="6" strokeLinecap="round" />
              <polygon points={`${x},${172+jetLen} ${x-9},${156+jetLen} ${x+9},${156+jetLen}`} fill="#60a5fa" />
              <text x={x + 18} y={164 + jetLen/2} fill="#60a5fa" fontSize="13" fontWeight="800">الفعل</text>
              <line x1={x} y1="40" x2={x} y2={40 - jetLen*0.6} stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
              <polygon points={`${x},${34-jetLen*0.6} ${x-9},${50-jetLen*0.6} ${x+9},${50-jetLen*0.6}`} fill="#f59e0b" />
              <text x={x + 22} y={40 - jetLen*0.3} fill="#f59e0b" fontSize="13" fontWeight="800">رد الفعل</text>
            </>
          )}
        </svg>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto] items-center">
          <div>
            <p className="mb-2 text-[12px] font-black text-[var(--color-mist)]">كمية الهواء في البالون</p>
            <input type="range" min={20} max={100} step={10} value={air} onChange={e=>{setAir(Number(e.target.value)); if(!released) setJetLen(Number(e.target.value));}} className="w-full accent-[#3ce0f4]" />
          </div>
          <button onClick={()=>{setReleased(true); setX(v=>v);}} className="btn btn-phys !py-2 !text-[12px]" onMouseDown={step}>إطلاق</button>
          <button onClick={()=>{setReleased(false); setX(60); setJetLen(air);}} className="btn btn-ghost !py-2 !text-[12px]"><RotateCcw className="h-4 w-4" />إعادة</button>
        </div>
      </div>
      <div className="rounded-2xl border border-[rgba(255,176,58,0.2)] bg-[rgba(255,176,58,0.06)] p-5">
        <h4 className="text-[15px] font-black text-[var(--color-chem)] mb-3">الفعل ورد الفعل بصريًا</h4>
        <p className="text-[13.5px] font-bold leading-7 text-[#ffe4b8]">
          عندما يخرج الهواء من البالون إلى الأسفل (الفعل)، يدفع الهواء البالون إلى الأعلى/الأمام برد فعل مساوٍ له في الشدة ومعاكس له في الجهة. القوتان لا تؤثران في الجسم نفسه، لذلك لا تلغي إحداهما الأخرى.
        </p>
      </div>
    </div>
  );
}
