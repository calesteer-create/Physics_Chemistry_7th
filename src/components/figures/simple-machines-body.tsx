import {
  Arrow,
  MachineScene,
  ML,
  Support,
  Load,
  MC,
} from "./simple-machines-figures";
import styles from "./simple-machines.module.css";
export function BodyLevers() {
  return (
    <div className={styles.grid}>
      <figure>
        <figcaption className={styles.heading}>
          الساعد — النوع الثالث
        </figcaption>
        <MachineScene title="المرفق ارتكاز، والعضلة جهد بينه وبين حمل اليد">
          <path
            d="M57 70V175Q57 192 78 190L256 156"
            stroke="#b48765"
            strokeWidth="19"
            fill="none"
            strokeLinecap="round"
          />
          <Support x={58} y={197} />
          <path
            d="M64 91Q112 104 122 177"
            stroke="#a8304a"
            strokeWidth="9"
            fill="none"
          />
          <Arrow x1={124} y1={175} x2={124} y2={112} color={MC.green} />
          <Load x={263} y={179} />
          <Arrow x1={263} y1={174} x2={263} y2={226} />
          <ML x={72} y={249}>
            المرفق
          </ML>
          <ML x={169} y={75}>
            شد العضلة
          </ML>
          <ML x={252} y={249}>
            الحمل
          </ML>
        </MachineScene>
      </figure>
      <figure>
        <figcaption className={styles.heading}>القدم — النوع الثاني</figcaption>
        <MachineScene title="مقدمة القدم ارتكاز، وثقل الجسم عند الكاحل بين الارتكاز وشد وتر العقب">
          <path
            d="M54 213Q95 206 138 166L247 159Q266 182 237 192L69 234Z"
            fill="#d7b38e"
            stroke="#7c5f36"
            strokeWidth="3"
          />
          <path d="M148 49V164" stroke="#b48765" strokeWidth="21" />
          <path d="M244 63V156" stroke="#a8304a" strokeWidth="7" />
          <Support x={55} y={235} />
          <Arrow x1={148} y1={87} x2={148} y2={156} />
          <Arrow x1={245} y1={157} x2={245} y2={88} color={MC.green} />
          <ML x={64} y={21}>
            ثقل الجسم
          </ML>
          <ML x={243} y={39}>
            شد الوتر
          </ML>
          <ML x={190} y={246} width={230}>
            الكاحل: المقاومة
          </ML>
        </MachineScene>
      </figure>
    </div>
  );
}
