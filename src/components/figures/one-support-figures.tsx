import { SvgTeX } from "@/components/math/TeX";
import type { ReactNode } from "react";
import { Carrier, Drawing, ink, Label, PointMark, Vector } from "./one-support-drawing";
import { addition, subtraction } from "./one-support-geometry";

// Original frame and arrow for the book-question plates (outside this revision).
const C = {
  paper: "#ffffff",
  frame: "#e7e3da",
  muted: "#5f6b84",
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

export function BookOnTableFigure() {
  return (
    <Drawing title="كتاب على طاولة تؤثر فيه قوتان متعاكستان" viewBox="100 53 344 182" maxWidth="32rem">
      <ellipse cx="269" cy="222" rx="150" ry="4" fill="#f0eee8" />
      <g strokeLinejoin="round" strokeWidth="1.5">
        <path d="M152 139h13l-4 70h-9z M389 139h12v70h-9z" fill="#d6c5aa" stroke="#9f8c72" />
        <path d="M134 141h15l-3 80h-12z M371 141h15v80h-12z" fill="#a67d53" stroke="#76573d" />
        <path d="M120 128l13-7h286l-11 7z" fill="#e8d8bd" stroke="#ac8a64" />
        <rect x="120" y="128" width="299" height="12" rx="3" fill="#ba956e" stroke="#76573d" />
        <path d="M249 103l11-19h101l9 19z" fill="#88aea8" stroke={ink.teal} />
        <rect x="249" y="103" width="121" height="22" rx="4" fill="#fffaf0" stroke="#ae9a7a" />
        <path d="M251 105h116 M251 124h118" fill="none" stroke={ink.teal} strokeWidth="4" strokeLinecap="round" />
        <path d="M257 111h103 M257 117h96" stroke="#d4c5af" />
        <path d="M338 117h8v13l-4-3-4 3z" fill="#b66349" stroke="none" />
      </g>
      <Carrier from={[192, 84]} to={[429, 84]} />
      <Vector from={[290, 84]} to={[220, 84]} color={ink.first} />
      <Vector from={[330, 84]} to={[408, 84]} color={ink.second} />
      <PointMark at={[290, 84]} radius={3} /><PointMark at={[330, 84]} radius={3} />
    </Drawing>
  );
}

/** Side profile anchored at the hand gripping the rope; mirror the pose, not the carrier. */
function Puller({ shirt, skin }: { shirt: string; skin: string }) {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M-30 19l4 15 12 14" fill="none" stroke="#657882" strokeWidth="8" />
      <path d="M-31 19l-8 15-13 15" fill="none" stroke={ink.body} strokeWidth="9" />
      <path d="M-54 49h11 M-16 49h10" stroke={ink.body} strokeWidth="5" />
      <path d="M-39 -11q6-4 11 1l10 23-13 9-8-17q-4-9 0-16z" fill={shirt} />
      <path d="M-35 -10l-3-7 6-3 4 8" fill={skin} />
      <path d="M-46 -24a9 9 0 0 1 17-4l2 7-3 1q-3 8-9 5-7-2-7-9z" fill={skin} />
      <path d="M-47 -22q-4-13 6-15 8-2 12 7-9-2-12 6l-3 5z" fill="#443a38" />
      <path d="M-31 -7l10 14 13-5" fill="none" stroke={skin} strokeWidth="5.5" />
      <path d="M-34 -5l13 5 18-1" fill="none" stroke={shirt} strokeWidth="7" />
      <path d="M-5 -1h6" stroke={skin} strokeWidth="6" />
    </g>
  );
}

export function TugOfWarFigure() {
  return (
    <Drawing title="تجربة شد الحبل" viewBox="80 60 503 121" maxWidth="37rem">
      <path d="M92 165h59 M511 165h61" fill="none" stroke={ink.line} strokeWidth="2" strokeLinecap="round" />
      <path d="M144 112h376" stroke="#86673f" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M144 111.5h376" stroke="#ddc59a" strokeWidth="1.5" strokeDasharray="4 3" />
      <g transform="translate(150 112)"><Puller shirt={ink.teal} skin="#d7a37e" /></g>
      <g transform="translate(514 112) scale(-1 1)"><Puller shirt={ink.resultant} skin="#bc8663" /></g>
    </Drawing>
  );
}

export function CarPullersFigure() {
  // The original tow line through (160,200) and (350,150), extended through all three grips.
  const ropeY = (x: number) => 200 - (x - 160) * 50 / 190;
  return (
    <Drawing title="سيارة يسحبها أشخاص عدة على نفس الحامل" viewBox="22 81 482 142" maxWidth="37rem">
      <ellipse cx="97" cy="210" rx="67" ry="3" fill="#e7e9e7" />
      <g strokeLinejoin="round">
        <path d="M32 185q1-8 12-9l13-24q3-5 11-5h40q7 0 12 7l14 16 15 5q7 2 7 12v10H32z" fill="#7195b9" stroke="#3c597a" strokeWidth="2" />
        <path d="M49 173l13-20h17v20z M85 153h22q4 0 7 5l12 15H85z" fill="#e6f0f2" stroke="#46627b" strokeWidth="2" />
        <path d="M81 177v14 M90 180h8 M36 190h115" fill="none" stroke="#456482" strokeWidth="1.5" />
        <rect x="144" y="179" width="10" height="5" rx="1.5" fill="#fff0bd" />
        {[57, 131].map(x => <g key={x}><circle cx={x} cy="197" r="12" fill={ink.body} /><circle cx={x} cy="197" r="6" fill="#d7dfe4" /><circle cx={x} cy="197" r="2.3" fill="#687c8a" /></g>)}
        <path d="M151 195l9 5" stroke={ink.body} strokeWidth="3" />
      </g>
      <line x1="160" y1="200" x2="449" y2={ropeY(449)} stroke="#86673f" strokeWidth="3" />
      <PointMark at={[160, 200]} radius={2.4} />
      {[350, 398, 446].map((x, i) => <g key={x} transform={`translate(${x} ${ropeY(x)}) scale(-.8 .8)`}>
        <Puller shirt={[ink.teal, ink.second, ink.resultant][i]} skin={["#be906e", "#e0b590", "#d0a17c"][i]} />
      </g>)}
    </Drawing>
  );
}

const firstSymbol = String.raw`\vec{F}_1`, secondSymbol = String.raw`\vec{F}_2`, resultSymbol = String.raw`\vec{F}`;

export function ResultantSameDirectionFigure() {
  const { origin, first, second, resultant } = addition;
  return (
    <Drawing title="محصلة قوتين على حامل واحد وبجهة واحدة" viewBox="0 0 212 185" maxWidth="21rem">
      <rect x="95" y="15" width="22" height="22" rx="3" fill="#e1ede3" stroke="#abc4ae" />
      <Carrier from={[106, 7]} to={[106, 148]} />
      {/* Back to front: three coincident shafts, three unobstructed tips. */}
      <Vector from={origin} to={resultant} color={ink.resultant} width={4.6} />
      <Vector from={origin} to={second} color={ink.second} width={4} />
      <Vector from={origin} to={first} color={ink.first} width={3.4} />
      <PointMark at={origin} />
      <Label at={[83, 24]} tex="O" />
      <Label at={[131, 67]} tex={firstSymbol} color={ink.first} />
      <Label at={[131, 92]} tex={secondSymbol} color={ink.second} />
      <Label at={[131, 135]} tex={resultSymbol} color={ink.resultant} />
      <rect x="17" y="151" width="178" height="29" rx="7" fill="#f3f6fa" />
      <text x="164" y="170" textAnchor="middle" direction="rtl" fill={ink.body} fontSize="13" fontWeight="600">حيث</text>
      <Label at={[90, 165]} tex="F = F_1 + F_2" width={124} />
    </Drawing>
  );
}

function SpringBalance({ accent }: { accent: string }) {
  return (
    <g strokeLinejoin="round">
      <rect width="132" height="34" rx="11" fill="#f7f4ec" stroke="#8d8271" strokeWidth="1.8" />
      <rect x="14" y="6" width="106" height="22" rx="5" fill="#fffefb" stroke="#c7bdaa" />
      <path d="M19 17h13l4-7 6 14 6-14 6 14 6-14 6 14 6-14 6 14 4-7h31" fill="none" stroke="#786951" strokeWidth="2" />
      <path d="M6 7v20" stroke={accent} strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

export function OppositeForcesRingFigure() {
  return (
    <Drawing title="حلقة بين ربيعتين متعاكستين" viewBox="24 55 378 141" maxWidth="34rem">
      <g stroke="#738393" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M162 103h28 M226 103h28" />
        <path d="M54 70v66 M376 70v66" />
        <circle cx="204" cy="103" r="22" stroke={ink.body} strokeWidth="5" />
      </g>
      <g transform="translate(40 86)"><SpringBalance accent={ink.first} /></g>
      <g transform="translate(386 86) scale(-1 1)"><SpringBalance accent={ink.second} /></g>
      <Carrier from={[47, 150]} to={[370, 150]} />
      <Vector from={[160, 150]} to={[70, 150]} color={ink.first} />
      <Vector from={[248, 150]} to={[338, 150]} color={ink.second} />
      <Label at={[112, 173]} tex={firstSymbol} color={ink.first} size={19} />
      <Label at={[294, 173]} tex={secondSymbol} color={ink.second} size={19} />
    </Drawing>
  );
}

export function ResultantOppositeForcesFigure() {
  const { origin, first, second, resultant } = subtraction;
  return (
    <Drawing title="محصلة قوتين على حامل واحد وبجهتين متعاكستين" viewBox="0 0 260 124" maxWidth="28rem">
      <Carrier from={[11, 54]} to={[249, 54]} />
      <Vector from={origin} to={first} color={ink.first} />
      <Vector from={origin} to={second} color={ink.second} width={4.6} />
      <Vector from={origin} to={resultant} color={ink.resultant} width={3.5} />
      <PointMark at={origin} />
      <Label at={[110, 72]} tex="O" />
      <Label at={[33, 32]} tex={firstSymbol} color={ink.first} />
      <Label at={[227, 32]} tex={secondSymbol} color={ink.second} />
      <Label at={[150, 32]} tex={resultSymbol} color={ink.resultant} />
      <rect x="55" y="88" width="150" height="29" rx="7" fill="#f3f6fa" />
      <Label at={[130, 102]} tex="F = F_2 - F_1" width={140} />
    </Drawing>
  );
}

export function DirectOppositeEqualForcesFigure() {
  const origin = [360, 96] as const;
  return (
    <Drawing title="القوتان المتعاكستان مباشرة" viewBox="108 37 504 95" maxWidth="34rem">
      <Carrier from={[121, 96]} to={[599, 96]} />
      <Vector from={origin} to={[150, 96]} color={ink.first} width={5} />
      <Vector from={origin} to={[570, 96]} color={ink.second} width={5} />
      <PointMark at={origin} radius={5} />
      <Label at={[360, 65]} tex="O" size={23} />
      <Label at={[155, 65]} tex={firstSymbol} color={ink.first} size={23} />
      <Label at={[565, 65]} tex={secondSymbol} color={ink.second} size={23} />
    </Drawing>
  );
}

function Magnet({ x, top }: { x: number; top: "S" | "N" }) {
  const north = "#426593", south = "#a94e3e";
  return (
    <g>
      <rect x={x} y="40" width="32" height="78" rx="4" fill={top === "N" ? north : south} />
      <path d={`M${x} 79h32v35q0 4-4 4h-24q-4 0-4-4z`} fill={top === "N" ? south : north} />
      <path d={`M${x + 3} 45v66`} stroke="white" opacity=".24" strokeWidth="2" />
      <Label at={[x + 16, 59]} tex={`\\mathrm{${top}}`} color="white" size={15} width={26} />
      <Label at={[x + 16, 99]} tex={`\\mathrm{${top === "N" ? "S" : "N"}}`} color="white" size={15} width={26} />
    </g>
  );
}

export function ActionReactionFigure() {
  return (
    <Drawing title="مبدأ الفعل ورد الفعل — مغناطيسان وبالون" viewBox="44 19 244 299" maxWidth="19rem">
      <rect x="50" y="25" width="232" height="120" rx="11" fill="#f5f7fa" />
      <Magnet x={74} top="S" /><Magnet x={156} top="N" />
      <Vector from={[120, 84]} to={[120, 132]} color={ink.resultant} />
      <Vector from={[204, 132]} to={[204, 84]} color={ink.second} />
      <rect x="50" y="154" width="232" height="157" rx="11" fill="#faf6ee" />
      <path d="M118 193c-22 0-35 18-35 41 0 21 13 39 32 47h6c19-8 32-26 32-47 0-23-13-41-35-41z"
        fill="#cc7e68" stroke={ink.second} strokeWidth="1.8" />
      <path d="M92 228q2-18 16-23" fill="none" stroke="#f6daca" strokeWidth="4" strokeLinecap="round" />
      <path d="M115 280h6l4 12h-14z" fill={ink.second} />
      <Vector from={[184, 230]} to={[184, 184]} color={ink.resultant} />
      <text x="232" y="213" textAnchor="middle" direction="rtl" fill={ink.resultant} fontWeight="600" fontSize="16">رد الفعل</text>
      <Vector from={[184, 250]} to={[184, 300]} color={ink.second} />
      <text x="232" y="278" textAnchor="middle" direction="rtl" fill={ink.second} fontWeight="600" fontSize="16">الفعل</text>
    </Drawing>
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
