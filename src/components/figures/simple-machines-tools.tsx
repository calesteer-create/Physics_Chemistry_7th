import {
  Arrow,
  MachineScene,
  ML,
  Support,
  MC,
  LeverDiagram,
} from "./simple-machines-figures";
import styles from "./simple-machines.module.css";
export function OpenerDiagram() {
  return (
    <MachineScene title="المفك رافعة ترفع الغطاء بالاستناد إلى حافة العلبة">
      <path
        d="M62 157v92q0 20 47 20t47 -20v-92"
        fill="#d9e4ec"
        stroke="#566c7b"
        strokeWidth="3"
      />
      <ellipse
        cx="109"
        cy="157"
        rx="47"
        ry="12"
        fill="#c8d7e0"
        stroke="#566c7b"
        strokeWidth="3"
      />
      <path
        d="M65 145l88 -17"
        stroke="#566c7b"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path d="M129 146L256 84" stroke="#6d8291" strokeWidth="8" />
      <path
        d="M218 102L270 77"
        stroke="#23608f"
        strokeWidth="20"
        strokeLinecap="round"
      />
      <Support x={154} y={143} />
      <Arrow x1={249} y1={28} x2={249} y2={72} color={MC.green} />
      <Arrow x1={113} y1={159} x2={113} y2={102} />
      <ML x={250} y={14}>
        قوة اليد
      </ML>
      <ML x={77} y={77}>
        رفع الغطاء
      </ML>
      <ML x={224} y={192}>
        حافة العلبة
      </ML>
      <path
        d="M194 184L157 153"
        stroke="#566c7b"
        strokeDasharray="4 4"
        strokeWidth="2"
      />
    </MachineScene>
  );
}
export function LeverTypes() {
  return (
    <div className={styles.grid}>
      {[1, 2, 3].map((n) => (
        <figure className={styles.panel} key={n}>
          <figcaption>النوع {n}</figcaption>
          <LeverDiagram type={n} />
        </figure>
      ))}
    </div>
  );
}
export function ToolElements({
  tool,
}: {
  tool: "barrow" | "rock" | "pliers" | "opener" | "clip" | "pin";
}) {
  if (tool === "opener") return <OpenerDiagram />;
  return (
    <MachineScene title={`عناصر الرافعة: ${tool}`}>
      {tool === "barrow" ? (
        <>
          <circle
            cx="66"
            cy="205"
            r="29"
            fill="#cbd5df"
            stroke="#43576c"
            strokeWidth="6"
          />
          <path
            d="M45 107l29 76h122l27 -76Z"
            fill="#cce2cd"
            stroke={MC.green}
            strokeWidth="4"
          />
          <path
            d="M66 205l157 -57 60 -12M167 183l27 47h23"
            fill="none"
            stroke="#566c7b"
            strokeWidth="6"
          />
          <path
            d="M78 112l19 -24 17 9 24 -21 25 21 21 -3 23 18"
            fill="#bba17b"
            stroke={MC.edge}
            strokeWidth="2"
          />
          <Support x={66} y={237} />
          <Arrow x1={149} y1={110} x2={149} y2={161} />
          <Arrow x1={278} y1={194} x2={278} y2={141} color={MC.green} />
          <ML x={159} y={49}>
            المقاومة: الحمل
          </ML>
        </>
      ) : tool === "rock" ? (
        <>
          <path
            d="M64 180l6 -49 22 -35 28 10 22 37 -9 37Z"
            fill="#b6bdc7"
            stroke="#566c7b"
            strokeWidth="3"
          />
          <path d="M90 185L273 79" stroke={MC.edge} strokeWidth="9" />
          <Support x={139} y={161} />
          <Arrow x1={257} y1={33} x2={257} y2={78} color={MC.green} />
          <Arrow x1={98} y1={189} x2={98} y2={144} />
          <ML x={175} y={232}>
            الارتكاز عند الحاجز
          </ML>
        </>
      ) : tool === "pliers" ? (
        <>
          <path
            d="M96 87L228 207M229 86L97 208"
            stroke="#566c7b"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <circle
            cx="162"
            cy="148"
            r="10"
            fill="#e3cda4"
            stroke={MC.edge}
            strokeWidth="3"
          />
          <path
            d="M90 80q-32 3 -5 37m151 -37q32 3 5 37"
            fill="none"
            stroke="#566c7b"
            strokeWidth="9"
          />
          <Arrow x1={64} y1={201} x2={108} y2={201} color={MC.green} />
          <Arrow x1={258} y1={201} x2={214} y2={201} color={MC.green} />
          <ML x={164} y={48}>
            المقاومة عند الفكين
          </ML>
          <ML x={160} y={256}>
            الارتكاز: المفصل
          </ML>
        </>
      ) : tool === "pin" ? (
        <>
          <path
            d="M52 123l218 58M52 189l218 -58"
            stroke={MC.edge}
            strokeWidth="18"
            strokeLinecap="round"
          />
          <circle
            cx="163"
            cy="155"
            r="18"
            fill="#dde5ec"
            stroke="#566c7b"
            strokeWidth="5"
          />
          <Arrow x1={73} y1={55} x2={73} y2={105} color={MC.green} />
          <Arrow x1={73} y1={254} x2={73} y2={204} color={MC.green} />
          <ML x={237} y={83}>
            الفكان
          </ML>
        </>
      ) : (
        <>
          <path d="M112 93h96v102h-96Z" fill="#3d4a5f" />
          <path
            d="M117 184L97 49Q94 24 123 26L160 28 198 26Q227 24 224 49L204 184"
            stroke="#849bac"
            strokeWidth="6"
            fill="none"
          />
          <ML x={160} y={247}>
            مشبك الورق
          </ML>
        </>
      )}
    </MachineScene>
  );
}
