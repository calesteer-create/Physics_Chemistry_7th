"use client";

/**
 * «أراجع وأختبر نفسي — الوحدة الأولى»: قسم مراجعة ختامي مستقل عن الاختبار
 * الإلكتروني وليس بديلاً عنه. أربع محطات + لوحة مراجعة، وتغذية راجعة تفسيرية،
 * وتلميحات، وحلول كاملة بعد المحاولة، وتتبّع للأخطاء مع إمكانية إعادتها.
 */
import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  LayoutList,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import {
  reviewItemCount,
  reviewStations,
  type ReviewItem,
} from "@/content/unit1-review";
import { lessonNames, lessonSlugs } from "@/content/unit1-assessment";
import { RichText } from "@/components/content/RichText";
import {
  BeetlePath,
  BodiesTable,
  RestGraph,
  SpringScalesFigure,
  UniformGraph,
  AcceleratedGraph,
} from "@/components/figures/unit1-review-figures";
import { TrueFalseFix, SingleChoice, PairChoice, NumberItemView } from "./ObjectiveItems";
import {
  DiagramItemView,
  PlotItemView,
  ScalesItemView,
  TableItemView,
} from "./ActivityItems";
import {
  countAnswered,
  countCorrect,
  percentage,
  type ReviewResults,
} from "@/lib/unit1-review";
import styles from "./unit1-review.module.css";

const FIGURES: Record<string, ReactNode> = {
  "graph-uniform": <UniformGraph />,
  "graph-accelerated": <AcceleratedGraph />,
  "graph-rest": <RestGraph />,
  bodies: <BodiesTable />,
  beetle: <BeetlePath />,
  springs: <SpringScalesFigure />,
};

function ItemView({ item, onResult }: { item: ReviewItem; onResult: (ok: boolean) => void }) {
  switch (item.kind) {
    case "tf":
      return <TrueFalseFix item={item} onResult={onResult} />;
    case "single":
      return <SingleChoice item={item} onResult={onResult} />;
    case "pair":
      return <PairChoice item={item} onResult={onResult} />;
    case "number":
      return <NumberItemView item={item} onResult={onResult} />;
    case "table":
      return <TableItemView item={item} onResult={onResult} />;
    case "plot":
      return <PlotItemView item={item} onResult={onResult} />;
    case "scales":
      return <ScalesItemView item={item} onResult={onResult} />;
    case "diagram":
      return <DiagramItemView item={item} onResult={onResult} />;
    default:
      return null;
  }
}

export function Unit1Review() {
  const [active, setActive] = useState(0);
  const [results, setResults] = useState<ReviewResults>({});
  const [tokens, setTokens] = useState<Record<string, number>>({});
  const [globalToken, setGlobalToken] = useState(0);

  const total = reviewItemCount;
  const answered = countAnswered(results);
  const correct = countCorrect(results);

  const summary = useMemo(
    () =>
      reviewStations.map((station) => {
        const done = station.items.filter((item) => results[item.id] !== undefined).length;
        const right = station.items.filter((item) => results[item.id] === true).length;
        return { station, done, right, total: station.items.length };
      }),
    [results],
  );

  const wrong = useMemo(
    () =>
      reviewStations.flatMap((station) =>
        station.items
          .filter((item) => results[item.id] === false)
          .map((item) => ({ station, item })),
      ),
    [results],
  );

  function recordResult(itemId: string, ok: boolean) {
    setResults((current) => ({ ...current, [itemId]: ok }));
  }

  function retryItem(itemId: string) {
    setResults((current) => ({ ...current, [itemId]: undefined }));
    setTokens((current) => ({ ...current, [itemId]: (current[itemId] ?? 0) + 1 }));
  }

  function resetAll() {
    setResults({});
    setTokens({});
    setGlobalToken((value) => value + 1);
    setActive(0);
  }

  const isSummary = active >= reviewStations.length;
  const station = isSummary ? null : reviewStations[active];

  return (
    <div className={styles.scope}>
      {/* الترويسة */}
      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroMain}>
        <span className={styles.badge}>
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          الوحدة الأولى — مراجعة ختامية
        </span>
        <h1 className={styles.heroTitle}>أراجع وأختبر نفسي — الوحدة الأولى</h1>
        <p className={styles.heroLead}>
          مراجعة تفاعلية لأسئلة الوحدة الأولى كما وردت في الكتاب المدرسي (ص 63–64):
          خمس عبارات صحّ/خطأ مع تصحيحها، وجدول كتلة وثقل، وثلاثة خطوط بيانية، وثلاث مسائل
          بجداولها ورسومها وحساباتها. ليست درسًا جديدًا، وليست بديلاً عن اختبار الوحدة الشامل.
        </p>

        <div className={styles.metaRow}>
          <span className={styles.meta}>
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            المصدر: ص 63–64
          </span>
          <span className={styles.meta}>
            <LayoutList className="h-3.5 w-3.5" aria-hidden="true" />
            4 محطات
          </span>
          <span className={styles.meta}>
            <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
            {total} بندًا
          </span>
          <span className={styles.meta}>
            <Target className="h-3.5 w-3.5" aria-hidden="true" />
            بلا درجة نهائية — تدرّب بحرية
          </span>
        </div>

        <ul className={styles.how}>
          {[
            "أجب أولًا، ثم اضغط «تحقّق من الإجابة» لتظهر التغذية الراجعة التي تشرح لماذا.",
            "استخدم التلميح عند الحاجة، والحل الكامل والخطوات متاحان بعد المحاولة.",
            "كل بند تخطئ فيه يُدرج في لوحة المراجعة، ويمكنك العودة إليه ومحاولته من جديد.",
          ].map((text, i) => (
            <li key={text} className={styles.howItem}>
              <span className={styles.howNum}>{i + 1}</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
          </div>

          <aside className={styles.heroAside} aria-label="محطات المراجعة">
            <h2 className={styles.asideTitle}>محطات المراجعة</h2>
            <ol className={styles.asideList}>
              {reviewStations.map((s) => (
                <li key={s.id} className={styles.asideItem}>
                  <span className={styles.asideNum}>{s.number}</span>
                  <span className={styles.asideText}>
                    <span className={styles.asideName}>{s.title}</span>
                    <span className={styles.asideMeta}>
                      {s.items.length} بنود — {s.source}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            <p className={styles.asideNote}>
              <GraduationCap className="h-4 w-4 shrink-0" aria-hidden="true" />
              أسئلة الكتاب نفسها بلا حذف ولا إضافة، مع كل معطياتها ورسومها.
            </p>
          </aside>
        </div>

        <div className={styles.overall}>
          <span className={styles.overallText}>
            أنجزت {answered} من {total}
          </span>
          <span className={styles.overallBar}>
            <span
              className={styles.overallFill}
              style={{ width: `${percentage(answered, total)}%` }}
            />
          </span>
        </div>
      </section>

      {/* تبويبات المحطات */}
      <nav className={styles.tabs} aria-label="محطات المراجعة">
        {reviewStations.map((s, i) => {
          const stat = summary[i];
          const activeTab = !isSummary && i === active;
          return (
            <button
              key={s.id}
              type="button"
              className={`${styles.tab} ${activeTab ? styles.tabActive : ""}`}
              aria-current={activeTab ? "step" : undefined}
              onClick={() => setActive(i)}
            >
              <span className={styles.tabNum}>{s.number}</span>
              <span className={styles.tabTitle}>{s.title}</span>
              <span className={styles.tabMeta}>
                {stat.done} من {stat.total} منجز
              </span>
            </button>
          );
        })}
        <button
          type="button"
          className={`${styles.tab} ${isSummary ? styles.tabActive : ""}`}
          aria-current={isSummary ? "step" : undefined}
          onClick={() => setActive(reviewStations.length)}
        >
          <span className={styles.tabNum} aria-hidden="true">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </span>
          <span className={styles.tabTitle}>لوحة المراجعة</span>
          <span className={styles.tabMeta}>
            {correct} صحيحة من {total} — راجع أخطاءك
          </span>
        </button>
      </nav>

      {/* لوحة المحطة */}
      {station ? (
        <section className={styles.panel} aria-labelledby={`station-${station.id}`}>
          <header className={styles.stationHead}>
            <div>
              <span className={styles.stationKicker}>
                المحطة {station.number} — {station.source}
              </span>
              <h2 className={styles.stationTitle} id={`station-${station.id}`}>
                {station.title}
              </h2>
              <p className={styles.stationSub}>{station.subtitle}</p>
            </div>
            <span className={styles.stationCount}>
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {summary[active].done} من {summary[active].total}
            </span>
          </header>
          <div className={styles.stationBar}>
            <span
              className={styles.stationBarFill}
              style={{ width: `${percentage(summary[active].done, summary[active].total)}%` }}
            />
          </div>
          <p className={styles.intro}>
            <RichText rich={station.intro} />
          </p>

          {station.figure ? (
            <div className={styles.figureCard}>{FIGURES[station.figure] ?? null}</div>
          ) : null}

          {station.items.map((item) => {
            const figure = item.figure ? FIGURES[item.figure] : null;
            const groupStart =
              item.group &&
              (station.items.indexOf(item) === 0 ||
                station.items[station.items.indexOf(item) - 1]?.group?.id !== item.group.id);
            return (
              <div key={item.id}>
                {groupStart && item.group ? (
                  <div className={styles.group}>
                    <div className={styles.groupHead}>
                      <h3 className={styles.groupTitle}>{item.group.title}</h3>
                    </div>
                    {item.group.intro ? (
                      <p className={styles.groupIntro}>
                        <RichText rich={item.group.intro} />
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {figure ? <div className={styles.figureCard}>{figure}</div> : null}
                <ItemView
                  key={`${item.id}:${tokens[item.id] ?? 0}:${globalToken}`}
                  item={item}
                  onResult={(ok) => recordResult(item.id, ok)}
                />
              </div>
            );
          })}

          <div className={styles.nav}>
            {active > 0 ? (
              <button
                type="button"
                className={styles.ghost}
                onClick={() => setActive((current) => Math.max(0, current - 1))}
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                المحطة السابقة
              </button>
            ) : (
              <span />
            )}
            <span className={styles.navHint}>
              المحطة {active + 1} من {reviewStations.length}
            </span>
            {active < reviewStations.length - 1 ? (
              <button
                type="button"
                className={styles.primary}
                onClick={() => setActive((current) => current + 1)}
              >
                المحطة التالية
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                className={styles.primary}
                onClick={() => setActive(reviewStations.length)}
              >
                عرض لوحة المراجعة
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </section>
      ) : (
        /* لوحة المراجعة */
        <section className={styles.panel} aria-labelledby="review-summary">
          <div className={styles.summaryHead}>
            <div>
              <span className={styles.stationKicker}>لوحة المراجعة</span>
              <h2 className={styles.stationTitle} id="review-summary">
                نتيجة هذه المراجعة
              </h2>
              <p className={styles.stationSub}>
                نتيجة تدريبية في متصفحك فقط، لا تُحفظ ولا تُرسل، ويمكنك إعادة أي بند.
              </p>
            </div>
            <div className={styles.bigScore} aria-label={`${correct} من ${total}`}>
              {correct} / {total}
            </div>
          </div>

          <div className={styles.summaryGrid}>
            {summary.map((stat) => (
              <div key={stat.station.id} className={styles.summaryCard}>
                <p className={styles.summaryCardTitle}>
                  {stat.station.number}. {stat.station.title}
                </p>
                <div className={styles.summaryBar}>
                  <span
                    className={styles.summaryBarFill}
                    style={{ width: `${percentage(stat.right, stat.total)}%` }}
                  />
                </div>
                <p className={styles.summaryCount}>
                  {stat.right} صحيحة من {stat.total} — أجبت عن {stat.done}
                </p>
              </div>
            ))}
          </div>

          {wrong.length > 0 ? (
            <>
              <h3 className={styles.groupTitle} style={{ marginTop: 18 }}>
                بنود تحتاج مراجعة ({wrong.length})
              </h3>
              <ul className={styles.wrongList}>
                {wrong.map(({ station: s, item }) => (
                  <li key={item.id} className={styles.wrongItem}>
                    <span className={styles.wrongText}>
                      {s.number}. {s.title} — {item.label}
                    </span>
                    <button
                      type="button"
                      className={styles.ghost}
                      onClick={() => {
                        retryItem(item.id);
                        setActive(reviewStations.findIndex((st) => st.id === s.id));
                      }}
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      أعد المحاولة
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className={styles.summaryNote}>
              {answered === total
                ? "أكملت جميع البنود دون أخطاء مسجّلة. أحسنت!"
                : "لم تُسجّل أخطاء حتى الآن. أكمل بقية المحطات لتظهر صورة كاملة."}
            </p>
          )}

          <div className={styles.lessonLinks}>
            {lessonNames.map((name, i) => (
              <Link key={name} href={`/lessons/${lessonSlugs[i]}`} className={styles.lessonLink}>
                <GraduationCap className="ml-1 inline h-3.5 w-3.5" aria-hidden="true" />
                {name}
              </Link>
            ))}
          </div>

          <div className={styles.examCta}>
            <p className={styles.examText}>
              هذه المراجعة تختلف عن اختبار الوحدة الشامل المعتمد (30 سؤالًا بنمط مختلف).
              يمكنك خوضه بعد المراجعة.
            </p>
            <Link href="/quizzes/quiz-unit-1" className={styles.cta}>
              اختبار الوحدة الشامل
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className={styles.nav}>
            <button type="button" className={styles.ghost} onClick={resetAll}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              إعادة المراجعة من البداية
            </button>
            <button
              type="button"
              className={styles.primary}
              onClick={() => setActive(reviewStations.length - 1)}
            >
              العودة إلى المحطات
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
