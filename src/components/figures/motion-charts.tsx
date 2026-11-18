import { SvgTeX } from "@/components/math/TeX";
import { speedometerTip } from "@/lib/motion-model";

type LayoutProps = {
  children: (h: { sx: (v: number) => number; sy: (v: number) => number }) => React.ReactNode;
  W: number; H: number; ML: number; MR: number; MT: number; MB: number;
  xLabel: string; yLabel: string;
  gridX: number[]; gridY: number[];
  xMax: number; yMax: number;
};

function ChartLayout({ children, W, H, ML, MR, MT, MB, xLabel, yLabel, gridX, gridY, xMax, yMax }: LayoutProps) {
  const iw = W - ML - MR, ih = H - MT - MB;
  const sx = (v: number) => ML + (v / xMax) * iw;
  const sy = (v: number) => H - MB - (v / yMax) * ih;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full max-w-[520px]" role="img">
      <rect x={ML} y={MT} width={iw} height={ih} rx="12" fill="rgba(60,224,244,0.03)" stroke="var(--color-line)" strokeWidth="1.5" />
      {/* grid */}
      {gridY.map(v => (
        <g key={v}>
          <line x1={ML} y1={sy(v)} x2={W-MR} y2={sy(v)} stroke="var(--color-line)" strokeWidth="1" strokeDasharray="4 4" />
          <text x={ML-12} y={sy(v)+4} textAnchor="end" fontSize="12" fill="var(--color-dim)" fontWeight="700">{v}</text>
        </g>
      ))}
      {gridX.map(v => (
        <g key={v}>
          <line x1={sx(v)} y1={MT} x2={sx(v)} y2={H-MB} stroke="var(--color-line)" strokeWidth="1" strokeDasharray="4 4" />
          <text x={sx(v)} y={H-MB+22} textAnchor="middle" fontSize="12" fill="var(--color-dim)" fontWeight="700">{v}</text>
        </g>
      ))}
      {/* axes */}
      <line x1={ML} y1={MT-8} x2={ML} y2={H-MB+8} stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1={ML-8} y1={H-MB} x2={W-MR+8} y2={H-MB} stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round" />
      {/* KaTeX labels */}
      <SvgTeX tex={yLabel} x={ML-60} y={MT-26} width={58} height={20} align="end" color="var(--color-phys)" fontSize="14px" />
      <SvgTeX tex={xLabel} x={W-MR+8} y={H-MB+8} width={42} height={20} align="start" color="var(--color-phys)" fontSize="14px" />
      {children({ sx, sy })}
    </svg>
  );
}

export function UniformMotionChart() {
  const pts = [[0,0],[2,36],[4,72],[6,108],[8,144]];
  return (
    <ChartLayout W={440} H={310} ML={70} MR={50} MT={40} MB={64} xLabel="t(\mathrm{s})" yLabel="d(\mathrm{m})" xMax={8} yMax={160} gridX={[0,2,4,6,8]} gridY={[0,40,80,120,160]}>
      {({ sx, sy }) => (
        <>
          <polyline points={pts.map(([t,d])=>`${sx(t)},${sy(d)}`).join(" ")} fill="none" stroke="var(--color-success)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          {pts.map(([t,d],i) => (
            <circle key={i} cx={sx(t)} cy={sy(d)} r="7" fill="white" stroke="var(--color-success)" strokeWidth="3.5" />
          ))}
        </>
      )}
    </ChartLayout>
  );
}

export function UniformMotionChart2() {
  const pts = [[0,30],[1,40],[2,50],[3,60],[4,70],[5,80],[6,90]];
  return (
    <ChartLayout W={440} H={310} ML={70} MR={50} MT={40} MB={64} xLabel="t(\mathrm{s})" yLabel="d(\mathrm{m})" xMax={6} yMax={100} gridX={[0,1,2,3,4,5,6]} gridY={[0,20,40,60,80,100]}>
      {({ sx, sy }) => (
        <>
          <polyline points={pts.map(([t,d])=>`${sx(t)},${sy(d)}`).join(" ")} fill="none" stroke="var(--color-error)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          {pts.map(([t,d],i) => <circle key={i} cx={sx(t)} cy={sy(d)} r="6" fill="white" stroke="var(--color-error)" strokeWidth="3.5" />)}
        </>
      )}
    </ChartLayout>
  );
}

export function NonUniformMotionChart() {
  const pts = [[0,0],[1,1],[2,4],[3,9],[4,16]];
  return (
    <ChartLayout W={440} H={310} ML={70} MR={50} MT={40} MB={64} xLabel="t(\mathrm{s})" yLabel="d(\mathrm{m})" xMax={4} yMax={18} gridX={[0,1,2,3,4]} gridY={[0,4,8,12,16]}>
      {({ sx, sy }) => (
        <>
          <path d={`M${sx(0)},${sy(0)} Q${sx(2)},${sy(0)} ${sx(4)},${sy(16)}`} fill="none" stroke="var(--color-error)" strokeWidth="4.5" strokeLinecap="round" />
          {pts.map(([t,d],i) => <circle key={i} cx={sx(t)} cy={sy(d)} r="6" fill="white" stroke="var(--color-error)" strokeWidth="3.5" />)}
        </>
      )}
    </ChartLayout>
  );
}

export function StationaryChart() {
  return (
    <ChartLayout W={440} H={230} ML={70} MR={50} MT={40} MB={64} xLabel="t(\mathrm{s})" yLabel="d(\mathrm{m})" xMax={7} yMax={10} gridX={[0,1,2,3,4,5,6,7]} gridY={[0,5,10]}>
      {({ sx, sy }) => (
        <>
          <line x1={sx(0)} y1={sy(5)} x2={sx(7)} y2={sy(5)} stroke="var(--color-phys)" strokeWidth="4.5" strokeLinecap="round" />
          {[0,1,2,3,4,5,6,7].map(t => <circle key={t} cx={sx(t)} cy={sy(5)} r="6" fill="white" stroke="var(--color-phys)" strokeWidth="3.5" />)}
        </>
      )}
    </ChartLayout>
  );
}

export function SpeedometerSVG({ value = 80 }: { value?: number }) {
  const tip = speedometerTip(value);
  return (
    <div className="relative w-full max-w-[300px]">
      <svg viewBox="0 0 220 140" className="w-full h-auto drop-shadow-md">
        <defs>
          <radialGradient id="dialBg" cx="50%" cy="80%" r="65%">
            <stop offset="0%" stopColor="#1a2d4a" />
            <stop offset="100%" stopColor="#0b1428" />
          </radialGradient>
        </defs>
        <circle cx="110" cy="120" r="105" fill="#0b1428" stroke="var(--color-line)" strokeWidth="2" />
        <circle cx="110" cy="120" r="95" fill="url(#dialBg)" />
        <path d="M28 120 A82 82 0 0 1 192 120" fill="none" stroke="#1e3a5f" strokeWidth="18" strokeLinecap="round" />
        {[0,20,40,60,80,100,120,140].map(v=>{
          const a = (v/140)*180-180;
          const r1=68, r2=80, r3=54;
          const x1=110+r1*Math.cos(a*Math.PI/180);
          const y1=120+r1*Math.sin(a*Math.PI/180);
          const x2=110+r2*Math.cos(a*Math.PI/180);
          const y2=120+r2*Math.sin(a*Math.PI/180);
          const tx=110+r3*Math.cos(a*Math.PI/180);
          const ty=120+r3*Math.sin(a*Math.PI/180);
          return (
            <g key={v}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={v>=100?"var(--color-error)":"#94a3b8"} strokeWidth="2.5" strokeLinecap="round" />
              <text x={tx} y={ty+4} textAnchor="middle" fontSize="11" fill="#e8f0fc" fontWeight="800">{v}</text>
            </g>
          );
        })}
        <g>
          <line x1="110" y1="120" x2={tip.x} y2={tip.y} stroke="var(--color-error)" strokeWidth="5" strokeLinecap="round" />
          <circle cx="110" cy="120" r="8" fill="var(--color-error)" />
        </g>
        <circle cx="110" cy="120" r="4" fill="white" />
        <SvgTeX tex="\text{km/h}" x={80} y={91} width={60} height={18} align="center" color="var(--color-muted)" fontSize="13px" />
      </svg>
    </div>
  );
}

export function SkateboarderSVG() {
  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[rgba(6,14,30,0.3)] p-4">
      <svg viewBox="0 0 420 130" className="w-full h-auto">
        <line x1="20" y1="110" x2="400" y2="110" stroke="var(--color-dim)" strokeWidth="2" />
        {[60,160,260,360].map((x,i)=>(
          <g key={i}>
            <line x1={x} y1={110} x2={x} y2={118} stroke="var(--color-dim)" strokeWidth="1.5" />
            <text x={x} y={128} textAnchor="middle" fontSize="11" fill="var(--color-muted)" fontWeight="700">{i+1}</text>
          </g>
        ))}
        {[60,160,260,360].map((x,i)=>(
          <g key={i} transform={`translate(${x},0)`}>
            <circle cx="0" cy="102" r="4.5" fill="var(--color-error)" />
            <rect x="-18" y="88" width="36" height="5" rx="3" fill="var(--color-muted)" />
            <circle cx="-11" cy="94" r="4.5" fill="#1e293b" />
            <circle cx="11" cy="94" r="4.5" fill="#1e293b" />
            <path d="M-5 88 L-5 65 L6 64 L6 87 M0 70 L-16 78 M4 70 L18 79" stroke="var(--color-phys)" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="0" cy="58" r="8.5" fill="var(--color-chem)" />
          </g>
        ))}
      </svg>
    </div>
  );
}

export function CarReferenceSVG() {
  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[rgba(6,14,30,0.3)] p-4">
      <svg viewBox="0 0 320 140" className="w-full h-auto">
        <rect x="0" y="104" width="320" height="36" fill="#e2e8f0" />
        <line x1="0" y1="122" x2="320" y2="122" stroke="white" strokeWidth="2" strokeDasharray="20 12" />
        <g transform="translate(258,30)">
          <rect x="-4" y="38" width="8" height="40" rx="2" fill="#92400e" />
          <circle cx="0" cy="26" r="28" fill="var(--color-success)" opacity="0.85" />
          <circle cx="-14" cy="14" r="20" fill="var(--color-success)" opacity="0.7" />
          <circle cx="16" cy="10" r="22" fill="var(--color-success)" opacity="0.75" />
        </g>
        <g transform="translate(60,78)">
          <path d="M0 26 H130 L115 4 H22 Z" fill="var(--color-phys)" />
          <rect x="10" y="26" width="112" height="20" rx="8" fill="var(--color-phys)" />
          <rect x="30" y="8" width="30" height="14" rx="4" fill="#dbeafe" opacity="0.95" />
          <rect x="66" y="8" width="28" height="14" rx="4" fill="#dbeafe" opacity="0.95" />
          <circle cx="28" cy="46" r="10" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2.5" />
          <circle cx="96" cy="46" r="10" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2.5" />
        </g>
      </svg>
    </div>
  );
}

export function PathTypesDiagram() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { title:"مسار دائري", color:"var(--color-chem)", bg:"var(--color-chem-lt)", draw:<circle cx="60" cy="55" r="38" fill="none" stroke="currentColor" strokeWidth="3.5" strokeDasharray="7 5" /> },
        { title:"مسار منحنٍ", color:"var(--color-phys)", bg:"var(--color-phys-lt)", draw:<path d="M18 85 Q58 10 102 85" fill="none" stroke="currentColor" strokeWidth="3.5" strokeDasharray="7 5" /> },
        { title:"مسار مستقيم", color:"var(--color-vio)", bg:"var(--color-vio-lt)", draw:<line x1="18" y1="55" x2="102" y2="55" stroke="currentColor" strokeWidth="3.5" strokeDasharray="7 5" /> },
      ].map((item,i)=>(
        <div key={i} className="rounded-2xl p-4 text-center border border-var(--color-line)" style={{ background: item.bg, color: item.color }}>
          <svg viewBox="0 0 120 110" className="mx-auto w-full max-w-[130px]">
            {item.draw}
            <circle cx="60" cy="55" r="6" fill="currentColor" />
          </svg>
          <div className="mt-2 text-[14px] font-black">{item.title}</div>
        </div>
      ))}
    </div>
  );
}
