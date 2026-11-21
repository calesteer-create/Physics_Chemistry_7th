# Lesson 5 and independent Unit 1 assessment — implementation / QA

Date: 2026-11-21 (UTC). Branch: `arena/755e832a-physics-chemistry-7th`.
Base: `e443a051c1a0c6be0a91895087d06575c7439200`.

## Delivered

- Published `/lessons/simple-machines/`: eight learning/practice stages plus a separate ninth notebook stage, covering pp. 53–62, mechanical advantage, machine families, levers, pulleys, ramp, screw, wheel/axle, body examples, work and power. Book activities include tool interpretation and explicitly uncertain historical pyramid methods outside the notebook.
- Five prediction-before-run interactions: editable inputs, animated state, numerical results, explanations and reset. Lever imbalance is qualitative; pulley/ramp models state ideal assumptions; screw interaction models advance, not a new force law. Explicit reduced-motion control and system preference are supported.
- Scientific SVGs with Arabic descriptions, direction-matched force arrows, isolated KaTeX quantities, separate supporting-strand diagrams and forearm/tiptoe examples.
- Separate lesson quiz `/quizzes/quiz-simple-machines-5/` and Unit 1 exam `/quizzes/quiz-unit-1/`; no use or modification of the old QuizRunner. The new runner uses the existing unchanged numeric-normalization helper, but its selection, submission and grading flow are isolated.
- Unit bank: 60 items, 30 slots × A/B. Each attempt: 30 questions, six per lesson; 10 basic / 15 medium / five advanced; 20 MCQ / five true-false / five numeric. One point each, no partial credit or negative marks. Advisory duration, no automatic timeout. Review and keys appear only after complete submission.
- Each lesson has three A and three B questions. With a valid previous form, two prior A and two prior B slots flip per lesson: exactly 20 changes total. Only the previous 30 validated IDs are persisted under `physics-unit1-previous-form-v1`; no answers, scores, identity or attempt flag. Missing/invalid/blocked storage falls back to a valid initial form.
- Static export only. No API, database, authentication, remote grading or new dependencies. Existing basePath, Pages/export configuration, fonts, identity and shared math components unchanged. Static answer keys are inspectable and are not claimed to be secret.

## Final checks

| Check | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS: 96 stage2 tests + 11 render/browser tests |
| `npm run build` | PASS: 23 static pages, including both new quiz routes and lesson |
| `git diff --check` | PASS |
| Pure model tests | Lever equilibrium/signs, pulley modes and work equality, ramp assumptions, screw advance, wheel ratio, invalid domains |
| Form simulation | 1,000 consecutive forms; all distributions, uniqueness, balance and exactly 20 flips verified |
| Browser audit | PASS: seven widths × 22 states = 154; zero page overflow and zero KaTeX errors |
| Browser interactions | All five labs animate/reset; fixed and combined pulley modes; prediction gate; complete exam 30/30, per-lesson results, incomplete-submit rejection, retry +20, blocked-storage fallback |
| Static/basePath | Export served below `/Physics_Chemistry_7th`; no failed assets, uncaught page errors or off-root fetch/XHR during audit |
| Entire bank render | All 60 prompts/options/explanations/diagrams mounted in Chromium, zero KaTeX/page errors |
| Notebook render | Heading text/order, 17 second-level headings (unit heading + 16 sections), three tables checked in Chromium |

Browser widths: **320, 360, 390, 768, 1024, 1440, 1920**. Raw measurements: [visual-results.json](visual-results.json). Smallest measured SVG foreignObject text: **13.375 CSS px** (above 12px requirement; most labels exceed 14px). Screenshots are viewport/element captures rather than enormous full-notebook captures, which exceeded Chromium screenshot limits. `captures/overview-*` covers every target width; figures and labs have 390/1440 evidence, with additional 320px figure captures. `body-forearm-390.png` and `body-tiptoe-390.png` show the final body diagrams.

### Contrast scope

[contrast-results.json](contrast-results.json) records pixel-background diagnostics for visible lesson explanation, lab and expanded book content at 390 and 1440. Text is hidden with transitions disabled before background sampling. Final minimum sampled ratio: **5.02:1**; no sampled item below 4.5:1. This is a diagnostic of sampled visible content, **not** a WCAG certification or exhaustive every-state/pixel audit; disabled/translucent text and shared sidebar are excluded. Essential figure palette against `#f7fafc`: ink 14.80, blue 6.38, red 6.29, green 6.17, wood-outline 5.65, rope 5.21 (all >3:1). Pale fills are decorative and have darker identifying outlines. Colour is reinforced with labels/arrow direction.

## Literal equality / unchanged legacy evidence

`tests/stage2/simple-machines.test.ts` checks:

1. Raw notebook exact equality to `approved/notebook.md` (allowing only the fixture's final newline). Raw source SHA-256: `70f7e510474b1c34d3aa4e4092fc103599639ce21150bc4313934803f600c169`; fixture SHA-256 with newline: `26ec8cc462214455222c1f4b2e3d7328f97a4039f8a362fa526ea18cc7a25577`.
2. Entire bank object, including wording, options, keys, explanations, levels and slot metadata, deep-equals `approved/unit1-bank.json`. Fixture SHA-256: `6c88fee971e9e90efcbf13a87b7c96c41a4249a14dbb219d9a84eeaf9e6d24c1`.
3. Notebook structured representation equals the parser output; no summarisation; 16 sections. The existing notebook invariance test only appends the new lesson baseline (`22b525b055dbcb43383b83911e8aa43cdcb7d994b9c479ee053b83dc79f7c402`), preserving all old baselines.
4. Byte-for-byte equality with `git show <base>:<path>` for all four old lesson sources, old quiz bank, QuizRunner, grading helper, quiz route, Next config, shared TeX, global styles and fonts. All old quiz/notebook tests continue to pass.

**Provenance limitation:** the approved fixtures are frozen transcriptions prepared during this implementation from the approved conversation content, not independently supplied signed source files. Equality checks prevent subsequent drift and establish internal source/fixture consistency; they cannot independently authenticate the earlier approval or guarantee error-free transcription. The separate browser check verifies rendered heading/table structure, not a byte-equivalence claim for rendered KaTeX DOM.

## Reproduce browser checks

After `npm ci` and `npm run build`, serve `out` below `/Physics_Chemistry_7th` on port 3000 (the session preview uses a local wrapper-directory symlink). Then:

```sh
node --import tsx tests/visual/simple-machines-audit.ts
node --import tsx tests/visual/simple-machines-contrast.ts
```

Chromium is the repository's existing `@sparticuz/chromium`/Playwright setup. Contrast diagnostics additionally require Python Pillow; the session installed it only under ignored `.cache/py` (not a project dependency). Tests extract Chromium runtime libraries when necessary. Browser QA was Chromium/Linux, not real iOS Safari/Android devices or assistive-technology certification.

## Remaining limitations

- Dependency audit reports one **moderate** direct Next.js advisory group in the existing pinned 16.4.2; no high/critical production findings in that run. Package versions were deliberately not changed as part of this lesson. The app is statically exported and does not use the server cache/Edge/image-optimization paths described by those advisories; this is not a substitute for a separately reviewed framework upgrade.
- Form variation guarantee applies only against the immediately preceding valid form on the same storage origin/device; it is not cross-device or a security guarantee.
- Simulations intentionally omit friction, component weights and advanced torque/trigonometry. Lever motion is explanatory, not a dynamics solver. Screw interaction makes no unsupported effort-reduction claim.
- No remote Pages deployment or production smoke test was performed. The PR is left open and unmerged for the user.
