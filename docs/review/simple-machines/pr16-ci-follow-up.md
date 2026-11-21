# PR #16 — CI correction and approval-provenance review

## Failure and reproduction

Original head: `8eba077f7362743b2f0bc9ffe23f13db471d9d25`.
Original run: https://github.com/calesteer-create/Physics_Chemistry_7th/actions/runs/44954063348

The GitHub jobs API confirms lint and typecheck passed, `npm test` failed, and build/export verification were skipped. The check annotation reports exit code 1. Attempts to retrieve the raw logs with both `gh run view --log-failed` and the job-logs REST endpoint failed with EOF after GitHub redirected to log-storage hosts outside this environment's network allowlist. Therefore **the original raw log was not read**; the precise failure below is directly observed in local reproduction, not quoted from that inaccessible log.

A fresh single-branch clone at the original head with `--depth 1`, a separate `npm ci`, Node 22.22.3 and no reused project node_modules/build output reproduced **95/96 stage2 tests passing and one failing**:

```text
legacy lesson sources, notebooks, quiz bank, runner, grading and publishing are byte-identical to base
Command failed: git show e443a051c1a0c6be0a91895087d06575c7439200:src/content/lessons/unit1/motion-and-rest.ts
fatal: path 'src/content/lessons/unit1/motion-and-rest.ts' exists on disk, but not in 'e443a051c1a0c6be0a91895087d06575c7439200'
```

The new regression test needs the fixed base commit, but `actions/checkout@v5` used default `fetch-depth: 1`. The implementation workspace happened to contain the base; a fresh CI checkout does not. Since the first test command fails, the render tests and subsequent build/export steps cannot run.

### Minimal fix

Set `fetch-depth: 0` on the existing checkout step. Keep the regression test and its fixed base untouched. No test skips, altered expectations, content changes, dependency changes or grading changes. No deployment trigger, permissions, basePath or Pages deployment changes.

### Clean local verification

In that same fresh clone, fetching full history makes `git cat-file -t <base>` return `commit`. Then:

- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm test`: PASS, 96 stage2 + 11 render/browser tests.
- `npm run build`: PASS.
- Exact export-verification shell block from the workflow: PASS, 23 index pages + 404; `.nojekyll`, `_next`, required pages and basePath link check pass.
- Additional explicit checks of exported lesson 5 and both new quiz routes: PASS.

This environment is Debian 12/Linux, not an Ubuntu VM. It matches the relevant CI conditions (fresh shallow checkout, clean npm install, Node 22); remote Actions on `ubuntu-latest` is the authoritative platform verification. Local diagnostic logs are scratch files, not committed dependencies/artifacts.

## Independent comparison with the conversation approval

The complete final approved notebook and complete approved 60-item bank are **not available in the current conversation context**. Only a condensed summary and implementation-era transcriptions remain. This was disclosed to the user before making changes.

| Requested comparison | Result |
|---|---|
| Actual full notebook vs user's final approved conversation text | **Not independently verifiable with available context.** No independent equality claim. |
| Actual full bank: prompts, all alternatives, keys, explanations and levels vs complete approved conversation bank | **Not independently verifiable with available context.** No independent equality claim. |
| Diversification mechanism vs full original approval | **No complete independent source comparison possible.** Existing tests verify the implemented rule (30 slots, six per lesson, three A/three B, exactly 20 changes against a valid immediate prior form), consistent with the available summary, but that is not authentication of the full original approval. |

The fixture-equality tests remain useful drift checks, **not independent proof of transcription accuracy or approval provenance**. No content was reconstructed from memory. The scientific content, notebook, bank, old notebooks and old quizzes were not changed in this correction. Independent approval verification remains unresolved until the original complete source is accessible; it is not marked closed merely because CI passes.

## Remote verification

See the PR checks for the correction commit. The successful run URL and final step outcomes will be recorded in the PR comment and user-facing follow-up after completion. PR #16 remains the only PR and must not be merged by the agent.
