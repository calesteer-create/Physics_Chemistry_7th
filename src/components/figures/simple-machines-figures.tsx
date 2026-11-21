import type { ReactNode } from "react";
import { TeX } from "@/components/math/TeX";
import type { AssessmentItem } from "@/content/unit1-assessment";
import styles from "./simple-machines.module.css";
export const MC = {
  ink: "#1a2438",
  blue: "#23608f",
  red: "#a8304a",
  green: "#0f6b52",
  wood: "#e3cda4",
  edge: "#7c5f36",
  rope: "#866332",
};
export function MachineScene({
  title,
  children,
  height = 280,
}: {
  title: string;
  children: ReactNode;
  height?: number;
}) {
  return (
    <svg
      className={styles.scene}
      viewBox={`0 0 320 ${height}`}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {children}
    </svg>
  );
}
export function ML({
  x,
  y,
  children,
  width = 120,
}: {
  x: number;
  y: number;
  children: ReactNode;
  width?: number;
}) {
  return (
    <foreignObject x={x - width / 2} y={y - 13} width={width} height="36">
      <div className={styles.label}>{children}</div>
    </foreignObject>
  );
}
export function MathLabel({
  x,
  y,
  tex,
  width = 100,
}: {
  x: number;
  y: number;
  tex: string;
  width?: number;
}) {
  return (
    <ML x={x} y={y} width={width}>
      <span dir="ltr" style={{ direction: "ltr", unicodeBidi: "isolate" }}>
        <TeX>{tex}</TeX>
      </span>
    </ML>
  );
}
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  color = MC.red,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
}) {
  const angle = Math.atan2(y2 - y1, x2 - x1),
    len = Math.hypot(x2 - x1, y2 - y1);
  return (
    <g
      transform={`translate(${x1} ${y1}) rotate(${(angle * 180) / Math.PI})`}
      fill={color}
    >
      <path
        d={`M0 -2.5 H${Math.max(0, len - 12)} V-7 L${len} 0 L${Math.max(0, len - 12)} 7 V2.5 H0Z`}
      />
    </g>
  );
}
export function Measure({
  x1,
  x2,
  y,
  tex,
}: {
  x1: number;
  x2: number;
  y: number;
  tex: string;
}) {
  return (
    <g>
      <path
        d={`M${x1} ${y - 5}v10m0 -5H${x2}m0 -5v10`}
        stroke={MC.blue}
        strokeWidth="2"
      />
      <MathLabel x={(x1 + x2) / 2} y={y + 21} tex={tex} />
    </g>
  );
}
export function Support({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path
        d={`M${x} ${y}l-17 32h34Z`}
        fill="#d8df8b"
        stroke={MC.green}
        strokeWidth="2"
      />
      <circle cx={x} cy={y} r="4" fill={MC.green} />
    </g>
  );
}
export function Load({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path
        d={`M${x - 22} ${y}h44l7 34h-58Z`}
        fill={MC.wood}
        stroke={MC.edge}
        strokeWidth="2"
      />
      <path d={`M${x} ${y}v-12`} stroke={MC.edge} strokeWidth="3" />
    </g>
  );
}
export function Pulley({
  x,
  y,
  angle = 0,
}: {
  x: number;
  y: number;
  angle?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <circle r="22" fill="#e1eaf0" stroke="#566c7b" strokeWidth="5" />
      <circle r="15" fill="none" stroke="#849bac" strokeWidth="2" />
      {[0, 60, 120].map((a) => (
        <path
          key={a}
          transform={`rotate(${a})`}
          d="M-17 0h34"
          stroke="#566c7b"
          strokeWidth="3"
        />
      ))}
      <circle r="4" fill={MC.ink} />
    </g>
  );
}
export function LeverDiagram({
  type = 1,
  f1 = "F_1",
  f2 = "F_2",
  d1 = "d_1",
  d2 = "d_2",
}: {
  type?: number;
  f1?: string;
  f2?: string;
  d1?: string;
  d2?: string;
}) {
  const ful = type === 1 ? 160 : 42,
    eff = type === 3 ? 145 : 278,
    res = type === 2 ? 155 : type === 3 ? 278 : 42;
  return (
    <MachineScene
      title={`رافعة: الارتكاز ${ful}، الجهد ${eff}، المقاومة ${res}`}
    >
      <path
        d="M26 143H294"
        stroke={MC.edge}
        strokeWidth="12"
        strokeLinecap="round"
      />
      <Support x={ful} y={150} />
      <Arrow x1={res} y1={150} x2={res} y2={214} />
      <Arrow
        x1={eff}
        y1={type === 1 ? 75 : 214}
        x2={eff}
        y2={type === 1 ? 137 : 152}
        color={MC.green}
      />
      <ML x={res === 42 ? 58 : res} y={240} width={110}>
        المقاومة
      </ML>
      <ML x={eff === 278 ? 263 : eff} y={type === 1 ? 48 : 240} width={110}>
        الجهد
      </ML>
      <ML x={ful === 42 ? 55 : ful} y={193} width={110}>
        الارتكاز
      </ML>
      <MathLabel x={res === 42 ? 55 : res} y={119} tex={f2} />
      <MathLabel
        x={type === 1 ? eff - 38 : eff === 278 ? 270 : eff}
        y={119}
        tex={f1}
      />
      {type === 1 && (
        <>
          <Measure x1={42} x2={160} y={25} tex={d2} />
          <Measure x1={160} x2={278} y={25} tex={d1} />
        </>
      )}
    </MachineScene>
  );
}
export function PulleyDiagram({
  mode = "moving",
  progress = 0,
}: {
  mode?: "fixed" | "moving" | "combined";
  progress?: number;
}) {
  const y = mode === "fixed" ? 70 : 160 - progress * 30;
  return (
    <MachineScene
      title={
        mode === "fixed"
          ? "بكرة ثابتة: سحب إلى الأسفل ورفع الحمل"
          : "بكرة متحركة: فرعان رأسيان يحملان المجموعة"
      }
    >
      <path d="M32 25H288" stroke={MC.ink} strokeWidth="7" />
      {mode === "fixed" ? (
        <>
          <path d="M160 25V48" stroke={MC.ink} strokeWidth="4" />
          <Pulley x={160} y={70} angle={progress * 180} />
          <path
            d={`M138 ${190 - progress * 60}V70A22 22 0 0 1 182 70V${120 + progress * 60}`}
            fill="none"
            stroke={MC.rope}
            strokeWidth="4"
          />
          <Load x={138} y={202 - progress * 60} />
          <Arrow x1={222} y1={107} x2={222} y2={167} color={MC.green} />
          <ML x={239} y={190}>
            جهد لأسفل
          </ML>
        </>
      ) : (
        <>
          <circle cx="103" cy="27" r="5" fill={MC.ink} />
          <path
            d={`M103 27V${y}A22 22 0 0 0 147 ${y}V${mode === "combined" ? 65 : 115 - progress * 60}`}
            fill="none"
            stroke={MC.rope}
            strokeWidth="4"
          />
          <Pulley x={125} y={y} angle={progress * 180} />
          <path d={`M125 ${y + 22}v18`} stroke={MC.ink} strokeWidth="3" />
          <Load x={125} y={y + 52} />
          {mode === "combined" ? (
            <>
              <Pulley x={169} y={65} angle={-progress * 180} />
              <path
                d={`M147 65A22 22 0 0 1 191 65V${120 + progress * 60}`}
                stroke={MC.rope}
                strokeWidth="4"
                fill="none"
              />
              <Arrow x1={233} y1={95} x2={233} y2={150} color={MC.green} />
              <ML x={239} y={177}>
                جهد لأسفل
              </ML>
            </>
          ) : (
            <>
              <Arrow
                x1={147}
                y1={115 - progress * 60}
                x2={147}
                y2={90 - progress * 60}
                color={MC.green}
              />
              <ML x={242} y={99}>
                جهد لأعلى
              </ML>
            </>
          )}
          <ML x={60} y={90} width={84}>
            فرع حامل
          </ML>
          <ML x={237} y={244} width={156}>
            المجموعة المتحركة
          </ML>
        </>
      )}
    </MachineScene>
  );
}
export function InclineDiagram({
  height = 3,
  length = 6,
  progress = 0,
}: {
  height?: number;
  length?: number;
  progress?: number;
}) {
  const rise = height * 23,
    run = Math.sqrt(Math.max(1, length * length - height * height)) * 20,
    x = 35 + progress * run,
    y = 240 - progress * rise,
    end = 35 + run;
  return (
    <MachineScene title="الرفع المباشر والطريق المائل إلى الارتفاع نفسه">
      <path
        d={`M35 243H${end}V${243 - rise}Z`}
        fill="#eee5d3"
        stroke={MC.edge}
        strokeWidth="3"
      />
      <path
        d={`M35 240L${end} ${240 - rise}H294`}
        stroke={MC.edge}
        strokeWidth="7"
        fill="none"
      />
      <g
        transform={`translate(${x} ${y - 21}) rotate(${(-Math.atan2(rise, run) * 180) / Math.PI})`}
      >
        <rect
          x="-13"
          y="-27"
          width="26"
          height="34"
          rx="6"
          fill="#bed5e3"
          stroke={MC.blue}
          strokeWidth="2"
        />
        <path d="M-13 -18h26m-26 17h26" stroke={MC.blue} />
      </g>
      <Arrow
        x1={60}
        y1={174}
        x2={114}
        y2={174 - (rise / run) * 54}
        color={MC.green}
      />
      <Arrow x1={300} y1={239} x2={300} y2={245 - rise} color={MC.blue} />
      <MathLabel x={258} y={77} tex={`h=${height}\\,\\mathrm{m}`} />
      <MathLabel x={153} y={264} tex={`L=${length}\\,\\mathrm{m}`} />
      <ML x={110} y={40}>
        الطريق المائل
      </ML>
    </MachineScene>
  );
}
export function ScrewDiagram({
  pitch = 10,
  turns = 0,
}: {
  pitch?: number;
  turns?: number;
}) {
  return (
    <MachineScene title="البرغي: دوران وتقدم، أسنان متقاربة وأخرى متباعدة">
      <path
        d="M65 212H260V248H65Z"
        fill={MC.wood}
        stroke={MC.edge}
        strokeWidth="2"
      />
      <g transform={`translate(0 ${Math.min(40, turns * pitch)})`}>
        <path d="M160 70V203" stroke="#667786" strokeWidth="18" />
        {Array.from({ length: Math.floor(115 / pitch) }, (_, i) => (
          <path
            key={i}
            d={`M148 ${83 + i * pitch}l24 -8`}
            stroke="#263c4c"
            strokeWidth="3"
          />
        ))}
        <g transform={`translate(160 64) rotate(${turns * 360})`}>
          <path
            d="M-43 0h86"
            stroke={MC.edge}
            strokeWidth="12"
            strokeLinecap="round"
          />
          <circle r="9" fill={MC.blue} />
        </g>
      </g>
      <ML x={160} y={20} width={280}>
        دورة واحدة ← تقدم
      </ML>
      <Arrow x1={224} y1={110} x2={224} y2={158} color={MC.blue} />
    </MachineScene>
  );
}
export function WheelDiagram({
  radius = 90,
  axle = 25,
  turns = 0,
}: {
  radius?: number;
  axle?: number;
  turns?: number;
}) {
  return (
    <MachineScene title="العجلة والمحور: الجهد عند حافة العجلة والقوة الناتجة عند المحور">
      <g transform={`translate(160 133) rotate(${turns * 360})`}>
        <circle r={radius} fill="#eef2f9" stroke={MC.blue} strokeWidth="7" />
        {[0, 60, 120].map((a) => (
          <path
            key={a}
            transform={`rotate(${a})`}
            d={`M${-radius} 0H${radius}`}
            stroke="#9bafc6"
            strokeWidth="4"
          />
        ))}
        <circle r={axle} fill={MC.wood} stroke={MC.edge} strokeWidth="4" />
      </g>
      <path
        d={`M${160 + axle} 133V${216 - Math.min(25, turns * axle)}`}
        stroke={MC.rope}
        strokeWidth="3"
      />
      <Load x={160 + axle} y={228 - Math.min(25, turns * axle)} />
      <Arrow
        x1={160 - radius}
        y1={113}
        x2={160 - radius}
        y2={56}
        color={MC.green}
      />
      <MathLabel x={112} y={145} tex="R" />
      <MathLabel x={179} y={117} tex="r" />
      <ML x={160} y={17}>
        الجهد عند العجلة
      </ML>
    </MachineScene>
  );
}
export function WedgeDiagram() {
  return (
    <MachineScene title="نصل الفأس إسفين يشق الخشب">
      <path
        d="M64 153H256V255H64Z"
        fill={MC.wood}
        stroke={MC.edge}
        strokeWidth="3"
      />
      <path
        d="M151 150l-7 36 17 -8 -8 35"
        fill="none"
        stroke={MC.edge}
        strokeWidth="3"
      />
      <path
        d="M125 105h70l-35 89Z"
        fill="#aab9c3"
        stroke="#405c70"
        strokeWidth="3"
      />
      <path d="M165 108L251 49" stroke={MC.edge} strokeWidth="13" />
      <Arrow x1={160} y1={30} x2={160} y2={84} color={MC.green} />
      <Arrow x1={119} y1={180} x2={81} y2={180} />
      <Arrow x1={201} y1={180} x2={239} y2={180} />
      <ML x={95} y={53}>
        دفع الإسفين
      </ML>
    </MachineScene>
  );
}
export function MachineAtlas() {
  return (
    <div className={styles.grid}>
      {[
        ["المستوى المائل", <InclineDiagram key="i" />],
        ["الإسفين", <WedgeDiagram key="w" />],
        ["البكرات", <PulleyDiagram key="p" />],
        ["البرغي", <ScrewDiagram key="s" />],
        ["الرافعة", <LeverDiagram key="l" />],
        ["العجلة والمحور", <WheelDiagram key="a" />],
      ].map(([title, node], i) => (
        <figure key={i} className={styles.panel}>
          <figcaption className={styles.heading}>{title}</figcaption>
          {node}
        </figure>
      ))}
    </div>
  );
}
export function AssessmentDiagram({ q }: { q: AssessmentItem }) {
  const b = q.id.endsWith("B");
  if (q.diagram === "moving-pulley") return <PulleyDiagram />;
  if (q.diagram === "screws")
    return (
      <div className={styles.grid}>
        <figure>
          <figcaption>أسنان أكثر تقارباً</figcaption>
          <ScrewDiagram pitch={9} />
        </figure>
        <figure>
          <figcaption>أسنان أكثر تباعداً</figcaption>
          <ScrewDiagram pitch={18} />
        </figure>
      </div>
    );
  if (q.diagram === "lever-class") return <LeverDiagram type={b ? 3 : 2} />;
  if (q.diagram === "lever-calculation")
    return (
      <>
        <p>رافعة أفقية متزنة، قوتاها عموديتان على العارضة.</p>
        <LeverDiagram
          f1="F=?"
          f2={b ? "180\\,\\mathrm{N}" : "200\\,\\mathrm{N}"}
          d1={b ? "0.9\\,\\mathrm{m}" : "0.8\\,\\mathrm{m}"}
          d2={b ? "30\\,\\mathrm{cm}" : "20\\,\\mathrm{cm}"}
        />
      </>
    );
  if (q.diagram === "distance-reference" || q.diagram === "total-distance") {
    const total = q.diagram === "total-distance";
    return (
      <MachineScene
        title={
          total
            ? "المسافة الكلية المقطوعة بدلالة الزمن، خط مستقيم صاعد"
            : "البعد عن المرجع بدلالة الزمن، خط أفقي"
        }
        height={300}
      >
        <Arrow x1={50} y1={230} x2={300} y2={230} color={MC.ink} />
        <Arrow x1={50} y1={230} x2={50} y2={44} color={MC.ink} />
        <ML x={168} y={15} width={300}>
          {total ? "المسافة الكلية المقطوعة" : "البعد عن المرجع"}
        </ML>
        <MathLabel x={274} y={263} tex={String.raw`t\,(\mathrm{s})`} />
        <MathLabel x={27} y={43} tex={String.raw`d\,(\mathrm{m})`} />
        {total ? (
          <>
            <path d="M50 230L250 70" stroke={MC.blue} strokeWidth="4" />
            <path
              d="M150 150H50m100 0v80m100 -160H50m200 0v160"
              stroke="#71869b"
              strokeDasharray="4 4"
              fill="none"
            />
            <MathLabel x={150} y={250} tex="2" />
            <MathLabel x={250} y={250} tex="4" />
            <MathLabel x={29} y={150} tex="6" />
            <MathLabel x={27} y={79} tex="12" />
          </>
        ) : (
          <>
            <path
              d={`M${b ? 70 : 50} 128H265`}
              stroke={MC.blue}
              strokeWidth="4"
            />
            <MathLabel x={26} y={128} tex={b ? "35" : "20"} />
            <MathLabel x={b ? 70 : 50} y={252} tex={b ? "2" : "0"} />
            <MathLabel x={265} y={252} tex={b ? "7" : "5"} />
          </>
        )}
      </MachineScene>
    );
  }
  return (
    <MachineScene title="تمثيل القوة والانتقال">
      <rect
        x="119"
        y="116"
        width="82"
        height="57"
        rx="8"
        fill={MC.wood}
        stroke={MC.edge}
        strokeWidth="2"
      />
      {q.diagram === "force-elements" ? (
        b ? (
          <>
            <Arrow x1={160} y1={82} x2={160} y2={216} />
            <MathLabel x={190} y={75} tex="A" />
            <MathLabel x={189} y={216} tex="C" />
          </>
        ) : (
          <>
            <Arrow x1={70} y1={144} x2={262} y2={144} />
            <MathLabel x={70} y={115} tex="O" />
            <MathLabel x={267} y={115} tex="B" />
          </>
        )
      ) : (
        <>
          <Arrow x1={118} y1={142} x2={35} y2={142} />
          <Arrow
            x1={202}
            y1={142}
            x2={285}
            y2={142}
            color={q.diagram === "work-opposite" ? MC.blue : MC.green}
          />
          <MathLabel
            x={65}
            y={104}
            tex={
              q.diagram === "opposite"
                ? b
                  ? "54\\,\\mathrm{N}"
                  : "32\\,\\mathrm{N}"
                : b
                  ? "d"
                  : "F"
            }
          />
          <MathLabel
            x={255}
            y={104}
            tex={
              q.diagram === "opposite"
                ? b
                  ? "36\\,\\mathrm{N}"
                  : "48\\,\\mathrm{N}"
                : b
                  ? "F"
                  : "d"
            }
          />
        </>
      )}
    </MachineScene>
  );
}
