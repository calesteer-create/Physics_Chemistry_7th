import { SvgTeX } from "@/components/math/TeX";
import { speedometerTip } from "@/lib/motion-model";

// نسخ للشرح فقط. تبقى رسومات الدفتر الأصلية مستقلة وغير معدلة.
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

export function ExplainedNonUniformMotionChart() {
  const pts = [[0,0],[1,1],[2,4],[3,9],[4,16]];
  return (
    <ChartLayout W={440} H={310} ML={70} MR={50} MT={40} MB={64} xLabel="t(\mathrm{s})" yLabel="d(\mathrm{m})" xMax={4} yMax={18} gridX={[0,1,2,3,4]} gridY={[0,4,8,12,16]}>
      {({ sx, sy }) => (
        <>
          <polyline points={pts.map(([t, d]) => `${sx(t)},${sy(d)}`).join(" ")} fill="none" stroke="var(--color-error)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          {pts.map(([t,d],i) => <circle key={i} cx={sx(t)} cy={sy(d)} r="6" fill="white" stroke="var(--color-error)" strokeWidth="3.5" />)}
        </>
      )}
    </ChartLayout>
  );
}

export function ExplainedSpeedometerSVG({ value = 80 }: { value?: number }) {
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
