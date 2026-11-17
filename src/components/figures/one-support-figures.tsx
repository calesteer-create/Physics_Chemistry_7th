import { SvgTeX } from "@/components/math/TeX";
import type { ReactNode } from "react";

const C = {
  paper: "#ffffff",
  surface: "#ffffff",
  frame: "#e7e3da",
  ink: "#24304a",
  muted: "#5f6b84",
  faint: "#94a3b8",
  blue: "#46629f",
  teal: "#17807a",
  coral: "#c96a4f",
  plum: "#7a4a72",
  gold: "#8a6420",
  green: "#7aa341",
  road: "#8b5a1f",
};

function Frame({ w, h, title, caption, children }: { w: number; h: number; title: string; caption?: string; children: ReactNode }) {
  return (
    <figure className="my-2">
      <div style={{ background: C.paper, border: `1.5px solid ${C.frame}`, borderRadius: 16, padding: 14 }}>
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto block" role="img" aria-label={title}>
          <title>{title}</title>
          {children}
        </svg>
      </div>
      {caption && <figcaption className="mt-2 text-center text-[12.5px] font-bold leading-6" style={{ color: C.muted }}>{caption}</figcaption>}
    </figure>
  );
}

function Arrow({ x1, y1, x2, y2, color, width = 4.6 }: { x1: number; y1: number; x2: number; y2: number; color: string; width?: number }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const angle = Math.atan2(dy, dx);
  const size = 16;
  const p1x = x2 - size * Math.cos(angle - 0.4);
  const p1y = y2 - size * Math.sin(angle - 0.4);
  const p2x = x2 - size * Math.cos(angle + 0.4);
  const p2y = y2 - size * Math.sin(angle + 0.4);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${p1x},${p1y} ${p2x},${p2y}`} fill={color} />
    </g>
  );
}

function SimpleCar({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <path d="M0 18 H90 L78 0 H18 Z" fill="#59b7ef" stroke="#3b82c4" strokeWidth="1.5" />
      <rect x="8" y="18" width="74" height="18" rx="6" fill="#59b7ef" stroke="#3b82c4" strokeWidth="1.5" />
      <rect x="25" y="4" width="18" height="10" rx="3" fill="#deeff8" />
      <rect x="47" y="4" width="18" height="10" rx="3" fill="#deeff8" />
      <circle cx="22" cy="36" r="8" fill="#24304a" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx="64" cy="36" r="8" fill="#24304a" stroke="#cbd5e1" strokeWidth="2" />
    </g>
  );
}

export function BookOnTableFigure() {
  return (
    <Frame w={640} h={260} title="كتاب على طاولة تؤثر فيه قوتان متعاكستان">
      <rect x={120} y={128} width={300} height={14} rx={3} fill={C.road} />
      <rect x={132} y={142} width={18} height={80} fill={C.road} />
      <rect x={272} y={142} width={18} height={80} fill={C.road} />
      <rect x={210} y={142} width={18} height={80} fill={C.road} />
      <rect x={312} y={142} width={18} height={80} fill={C.road} />
      <rect x={250} y={102} width={120} height={20} rx={3} fill="#e8e8e8" stroke="#c9c9c9" strokeWidth={1.5} />
      <path d="M250 102 h120 l-8 -18 h-104 z" fill="#b22222" />
      <rect x={262} y={86} width={96} height={18} rx={2} fill="#f8f4da" />
      <Arrow x1={290} y1={84} x2={220} y2={84} color={C.blue} />
      <Arrow x1={330} y1={84} x2={408} y2={84} color="#ef4444" />
    </Frame>
  );
}

export function TugOfWarFigure() {
  return (
    <Frame w={660} h={220} title="تجربة شد الحبل">
      <rect x={70} y={86} width={520} height={54} rx={18} fill="#fdfcf9" stroke={C.frame} />
      <path d="M168 112 C208 102 248 122 288 112 C328 102 368 122 408 112 C448 102 488 122 528 112" fill="none" stroke="#8b8b8b" strokeWidth="3" strokeDasharray="6 4" />
      <circle cx={126} cy={92} r={12} fill="#b6d15c" />
      <line x1={126} y1={104} x2={126} y2={140} stroke="#9bc441" strokeWidth={5} />
      <line x1={126} y1={114} x2={150} y2={112} stroke="#9bc441" strokeWidth={5} />
      <line x1={126} y1={114} x2={106} y2={132} stroke="#9bc441" strokeWidth={5} />
      <line x1={126} y1={140} x2={112} y2={164} stroke="#9bc441" strokeWidth={5} />
      <line x1={126} y1={140} x2={144} y2={164} stroke="#9bc441" strokeWidth={5} />
      <circle cx={538} cy={92} r={12} fill="#7cc7ff" />
      <line x1={538} y1={104} x2={538} y2={140} stroke="#6ab7ef" strokeWidth={5} />
      <line x1={538} y1={114} x2={514} y2={112} stroke="#6ab7ef" strokeWidth={5} />
      <line x1={538} y1={114} x2={558} y2={132} stroke="#6ab7ef" strokeWidth={5} />
      <line x1={538} y1={140} x2={522} y2={164} stroke="#6ab7ef" strokeWidth={5} />
      <line x1={538} y1={140} x2={554} y2={164} stroke="#6ab7ef" strokeWidth={5} />
    </Frame>
  );
}

export function CarPullersFigure() {
  return (
    <Frame w={620} h={250} title="سيارة يسحبها أشخاص عدة على نفس الحامل">
      <SimpleCar x={40} y={146} scale={1.3} />
      <line x1={160} y1={200} x2={350} y2={150} stroke="#94a3b8" strokeWidth={3} />
      {[0, 1, 2].map((i) => {
        const x = 370 + i * 48;
        const y = 142 - i * 8;
        return (
          <g key={i} transform={`translate(${x},${y})`}>
            <circle cx={0} cy={0} r={9} fill="#eac39b" />
            <line x1={0} y1={9} x2={0} y2={34} stroke="#2563eb" strokeWidth={4} />
            <line x1={0} y1={15} x2={-14} y2={28} stroke="#2563eb" strokeWidth={4} />
            <line x1={0} y1={15} x2={12} y2={12} stroke="#2563eb" strokeWidth={4} />
            <line x1={0} y1={34} x2={-12} y2={56} stroke="#2563eb" strokeWidth={4} />
            <line x1={0} y1={34} x2={12} y2={56} stroke="#2563eb" strokeWidth={4} />
          </g>
        );
      })}
    </Frame>
  );
}

export function ResultantSameDirectionFigure() {
  return (
    <Frame w={720} h={220} title="محصلة قوتين على حامل واحد وبجهة واحدة">
      <rect x={78} y={92} width={24} height={24} fill="#cfe98f" stroke="#a6c564" strokeWidth={1.5} />
      <circle cx={92} cy={104} r={6} fill={C.surface} stroke={C.ink} strokeWidth={2} />
      <SvgTeX tex="O" x={82} y={68} width={20} height={18} color={C.coral} fontSize="15px" />
      <Arrow x1={92} y1={104} x2={210} y2={104} color="#f2b632" width={5} />
      <SvgTeX tex="\vec{F_1}" x={132} y={72} width={44} height={18} color="#f2b632" fontSize="16px" />
      <Arrow x1={92} y1={104} x2={270} y2={104} color="#4aa9df" width={5} />
      <SvgTeX tex="\vec{F_2}" x={210} y={72} width={44} height={18} color="#4aa9df" fontSize="16px" />
      <Arrow x1={92} y1={104} x2={430} y2={104} color={C.coral} width={6.2} />
      <SvgTeX tex="\vec{F}" x={306} y={72} width={28} height={18} color={C.coral} fontSize="16px" />
      <text x={512} y={108} fill={C.ink} fontSize={15} fontWeight={700}>حيث</text>
      <SvgTeX tex="F = F_1 + F_2" x={546} y={92} width={140} height={22} color={C.ink} fontSize="16px" />
    </Frame>
  );
}

export function OppositeForcesRingFigure() {
  return (
    <Frame w={720} h={240} title="حلقة بين ربيعتين متعاكستين">
      <rect x={40} y={86} width={132} height={34} rx={14} fill="#fff8d1" stroke="#d8c580" strokeWidth={2} />
      <line x1={58} y1={103} x2={154} y2={103} stroke="#9b7f2e" strokeWidth={3} />
      <line x1={54} y1={70} x2={54} y2={136} stroke="#9b7f2e" strokeWidth={2} />
      <line x1={162} y1={103} x2={190} y2={103} stroke="#64748b" strokeWidth={3} />
      <circle cx={204} cy={103} r={22} fill="none" stroke="#222" strokeWidth={6} />
      <line x1={226} y1={103} x2={254} y2={103} stroke="#64748b" strokeWidth={3} />
      <rect x={254} y={86} width={132} height={34} rx={14} fill="#fff8d1" stroke="#d8c580" strokeWidth={2} />
      <line x1={272} y1={103} x2={368} y2={103} stroke="#9b7f2e" strokeWidth={3} />
      <line x1={376} y1={70} x2={376} y2={136} stroke="#9b7f2e" strokeWidth={2} />
      <Arrow x1={160} y1={150} x2={70} y2={150} color="#f2b632" />
      <SvgTeX tex="\vec{F_1}" x={108} y={124} width={44} height={18} color="#f2b632" fontSize="16px" />
      <Arrow x1={248} y1={150} x2={338} y2={150} color={C.coral} />
      <SvgTeX tex="\vec{F_2}" x={278} y={124} width={44} height={18} color={C.coral} fontSize="16px" />
    </Frame>
  );
}

export function ResultantOppositeForcesFigure() {
  return (
    <Frame w={720} h={220} title="محصلة قوتين على حامل واحد وبجهتين متعاكستين">
      <rect x={74} y={92} width={24} height={24} fill="#cfe98f" stroke="#a6c564" strokeWidth={1.5} />
      <circle cx={88} cy={104} r={6} fill={C.surface} stroke={C.ink} strokeWidth={2} />
      <SvgTeX tex="O" x={80} y={68} width={20} height={18} color={C.coral} fontSize="15px" />
      <Arrow x1={88} y1={104} x2={26} y2={104} color="#f2b632" width={5} />
      <SvgTeX tex="\vec{F_1}" x={20} y={72} width={44} height={18} color="#f2b632" fontSize="16px" />
      <Arrow x1={88} y1={104} x2={410} y2={104} color={C.coral} width={6.2} />
      <SvgTeX tex="\vec{F_2}" x={330} y={72} width={44} height={18} color={C.coral} fontSize="16px" />
      <Arrow x1={88} y1={104} x2={180} y2={104} color="#4aa9df" width={4.5} />
      <SvgTeX tex="\vec{F}" x={128} y={72} width={26} height={18} color="#4aa9df" fontSize="16px" />
      <SvgTeX tex="F = F_2 - F_1" x={470} y={90} width={140} height={20} color={C.ink} fontSize="16px" />
    </Frame>
  );
}

export function DirectOppositeEqualForcesFigure() {
  return (
    <Frame w={720} h={190} title="القوتان المتعاكستان مباشرة">
      <circle cx={360} cy={96} r={6} fill={C.surface} stroke={C.ink} strokeWidth={2} />
      <SvgTeX tex="O" x={350} y={64} width={20} height={18} color={C.coral} fontSize="15px" />
      <Arrow x1={360} y1={96} x2={150} y2={96} color="#f2b632" width={6} />
      <SvgTeX tex="\vec{F_1}" x={120} y={64} width={44} height={18} color="#f2b632" fontSize="16px" />
      <Arrow x1={360} y1={96} x2={570} y2={96} color={C.coral} width={6} />
      <SvgTeX tex="\vec{F_2}" x={540} y={64} width={44} height={18} color={C.coral} fontSize="16px" />
    </Frame>
  );
}

export function ActionReactionFigure() {
  return (
    <Frame w={720} h={340} title="مبدأ الفعل ورد الفعل — مغناطيسان وبالون">
      <rect x={26} y={26} width={220} height={126} rx={18} fill="#ffffff" />
      <rect x={26} y={178} width={220} height={126} rx={18} fill="#ffffff" />
      <rect x={74} y={40} width={32} height={78} rx={4} fill="#ef4444" />
      <rect x={74} y={80} width={32} height={38} rx={4} fill="#38bdf8" />
      <text x={90} y={62} textAnchor="middle" fill="white" fontSize={18} fontWeight={800}>S</text>
      <text x={90} y={106} textAnchor="middle" fill="white" fontSize={18} fontWeight={800}>N</text>
      <rect x={156} y={40} width={32} height={78} rx={4} fill="#38bdf8" />
      <rect x={156} y={80} width={32} height={38} rx={4} fill="#ef4444" />
      <text x={172} y={62} textAnchor="middle" fill="white" fontSize={18} fontWeight={800}>N</text>
      <text x={172} y={106} textAnchor="middle" fill="white" fontSize={18} fontWeight={800}>S</text>
      <Arrow x1={120} y1={84} x2={120} y2={132} color="#38bdf8" />
      <Arrow x1={204} y1={132} x2={204} y2={84} color="#ef4444" />
      <ellipse cx={118} cy={238} rx={34} ry={44} fill="#e45a5a" />
      <rect x={112} y={276} width={12} height={18} rx={3} fill="#b91c1c" />
      <Arrow x1={184} y1={230} x2={184} y2={184} color="#111827" />
      <text x={194} y={210} fill={C.coral} fontSize={18} fontWeight={800}>رد الفعل</text>
      <Arrow x1={184} y1={250} x2={184} y2={300} color="#111827" />
      <text x={194} y={270} fill={C.coral} fontSize={18} fontWeight={800}>الفعل</text>
    </Frame>
  );
}

/* ── الصفحة 39: صور الفعل ورد الفعل + البندقية ── */
export function ActionReactionExamplesGrid() {
  return (
    <Frame w={760} h={360} title="أمثلة الفعل ورد الفعل: صاروخ، يد وطاولة، كتاب وطاولة">
      {/* 3 cards */}
      {[30, 270, 510].map((x) => <rect key={x} x={x} y={24} width={210} height={128} rx={18} fill="#ffffff" stroke={C.frame} />)}
      {/* rocket */}
      <g transform="translate(134,42)">
        <path d="M0 12 C6 0 18 -4 24 12 V118 H0 Z" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2" />
        <polygon points="0,12 12,-16 24,12" fill="#ea580c" />
        <polygon points="0,82 -18,96 0,98" fill="#94a3b8" />
        <polygon points="24,82 42,96 24,98" fill="#94a3b8" />
        <Arrow x1={12} y1={112} x2={12} y2={54} color="#16a34a" width={4} />
        <Arrow x1={12} y1={126} x2={12} y2={166} color="#c4634a" width={4} />
      </g>
      {/* hand/table */}
      <g transform="translate(340,46)">
        <rect x="50" y="84" width="120" height="14" fill="#8b5a1f" />
        <rect x="158" y="98" width="14" height="48" fill="#8b5a1f" />
        <path d="M0 58 C8 26 46 14 74 24 C102 34 126 50 130 76 C132 92 118 98 104 94 C92 90 72 74 58 68 C42 60 28 58 16 68 C8 74 2 70 0 58 Z" fill="#f3c9a5" />
        <Arrow x1={52} y1={64} x2={18} y2={34} color="#16a34a" width={4} />
        <Arrow x1={106} y1={96} x2={138} y2={138} color="#8b5cf6" width={4} />
      </g>
      {/* book/table */}
      <g transform="translate(560,54)">
        <rect x="0" y="72" width="136" height="12" fill="#8b5a1f" />
        <rect x="12" y="84" width="12" height="54" fill="#8b5a1f" />
        <rect x="112" y="84" width="12" height="54" fill="#8b5a1f" />
        <rect x="54" y="60" width="40" height="12" fill="#b91c1c" />
        <rect x="60" y="52" width="28" height="10" fill="#e9d5ff" />
        <Arrow x1={74} y1={58} x2={74} y2={20} color="#16a34a" width={4} />
        <Arrow x1={74} y1={72} x2={74} y2={116} color="#8b5cf6" width={4} />
      </g>
      {/* rifle illustration */}
      <rect x={128} y={194} width={500} height={120} rx={18} fill="#dbeafe" stroke={C.frame} />
      <g transform="translate(222,236)">
        <circle cx="0" cy="18" r="18" fill="#334155" />
        <rect x="-8" y="34" width="18" height="40" rx="4" fill="#556b2f" />
        <line x1="0" y1="38" x2="-18" y2="72" stroke="#556b2f" strokeWidth="8" strokeLinecap="round" />
        <line x1="6" y1="38" x2="20" y2="70" stroke="#556b2f" strokeWidth="8" strokeLinecap="round" />
        <line x1="4" y1="48" x2="92" y2="-6" stroke="#c58c3b" strokeWidth="12" strokeLinecap="round" />
        <line x1="40" y1="28" x2="192" y2="-4" stroke="#9ca3af" strokeWidth="14" strokeLinecap="round" />
        <line x1="56" y1="32" x2="42" y2="78" stroke="#3f2a16" strokeWidth="6" strokeLinecap="round" />
        <path d="M44 78 C76 94 118 104 170 110" fill="none" stroke="#3f2a16" strokeWidth="4" />
        <Arrow x1={196} y1={-4} x2={234} y2={-12} color="#f59e0b" width={4} />
        <circle cx={244} cy="-14" r="6" fill="#6b7280" />
      </g>
    </Frame>
  );
}

/* ── الصفحة 40: المظلي ── */
export function ParachuteFigure() {
  return (
    <Frame w={720} h={420} title="مظلي تؤثر عليه قوتان: الثقل للأسفل ومقاومة الهواء للأعلى">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8bd3ff" />
          <stop offset="100%" stopColor="#d9f1ff" />
        </linearGradient>
      </defs>
      <rect x="24" y="24" width="672" height="372" rx="22" fill="url(#skyGrad)" />
      {/* clouds */}
      {[{x:520,y:90,s:1.2},{x:170,y:120,s:0.9},{x:604,y:166,s:0.8}].map((c,i)=>(
        <g key={i} transform={`translate(${c.x},${c.y}) scale(${c.s})`} opacity="0.85">
          <circle cx="0" cy="0" r="22" fill="white" />
          <circle cx="24" cy="-8" r="18" fill="white" />
          <circle cx="42" cy="4" r="20" fill="white" />
          <rect x="-8" y="4" width="58" height="18" rx="9" fill="white" />
        </g>
      ))}
      {/* parachute canopy */}
      <path d="M170 170 C230 94 364 74 474 170" fill="#b91c1c" />
      <path d="M474 170 C498 152 520 150 542 162 L542 194 C520 180 498 180 474 170Z" fill="#1d4ed8" />
      <path d="M474 170 C458 160 440 158 426 160 L426 190 C442 188 458 188 474 170Z" fill="#fbbf24" />
      {/* suspension lines */}
      {[188,208,228,252,280,308,336,364,392,420,448,468,492,516].map((x) => (
        <line key={x} x1={x} y1="170" x2="354" y2="286" stroke="rgba(255,255,255,0.8)" strokeWidth="2" />
      ))}
      {/* skydiver */}
      <circle cx="354" cy="300" r="10" fill="#111827" />
      <line x1="354" y1="310" x2="354" y2="346" stroke="#111827" strokeWidth="5" />
      <line x1="354" y1="324" x2="336" y2="344" stroke="#111827" strokeWidth="5" />
      <line x1="354" y1="324" x2="372" y2="344" stroke="#111827" strokeWidth="5" />
      <line x1="354" y1="346" x2="338" y2="374" stroke="#111827" strokeWidth="5" />
      <line x1="354" y1="346" x2="372" y2="374" stroke="#111827" strokeWidth="5" />
      {/* arrows */}
      <Arrow x1={354} y1={286} x2={354} y2={224} color="#16a34a" width={5} />
      <SvgTeX tex="\vec{F}_{\text{هواء}}" x={372} y={240} width={90} height={18} color="#16a34a" fontSize="14px" />
      <Arrow x1={354} y1={374} x2={354} y2={404} color="#c4634a" width={5} />
      <SvgTeX tex="\vec{w}" x={372} y={386} width={24} height={18} color="#c4634a" fontSize="16px" />
    </Frame>
  );
}
