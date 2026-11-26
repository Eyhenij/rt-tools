# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 1 — Specs wait for the sheet code; done
- **Done:** the owner approved the plan: «Одобряю план». 1.1 — the four specs 42 of 42; 1.2 — the kit
  suite exit 0. Piece (a) — `node tools/check-specs.mjs` exit 0; piece (b) — `pnpm run check:ngdoctor`
  exit 0 (score 94.75, equal to the threshold), the wrapper spec 4 of 4, `pnpm run check:unused` exit 0.
- **Next step:** piece (c), the kit weight 185800 → 218731, waits for the owner's word: accept the growth
  or cut it by a task of its own.
- **PR:** not open yet

## Steps

- [x] 1.1 Add `await rtPreloadPopoverSheet()` in `beforeAll` of the four sheet specs
- [x] 1.2 Run the whole kit suite

## Decisions along the way

- **Stage revision: the work grows by three pieces beyond stage 1, approved by the owner as «Одобряю план»** —
  `product-strategist` found three more red steps of the push set after the merge. The plan file was
  rewritten for them by mistake and is put back as its commit holds it; the pieces live here instead:
  (a) renumber the epic's colliding scenarios and their test titles, check `node tools/check-specs.mjs` →
  exit 0; (b) rename the date sheet wrapper
  `projects/ui-kit-v2/src/lib/components/date-picker/stories/component/test-date-sheet.component.ts` by its
  class and give it a spec, check `pnpm run check:ngdoctor` → exit 0; (c) bring the kit weight and
  `tools/kit-weight-threshold.json` together by the way the owner names, check `pnpm run check:kit-weight`
  → exit 0. Превышение следа плана: `docs/specs/ui-kit-v2/sheet-header-cards/`, `docs/specs/auth/theme/`,
  `docs/specs/message-bus/admin-shell/`, the date-picker stories and the weight threshold — по той же
  причине: без них набор перед отправкой эпика красный. Affected stage of the plan: 1.
- **Piece (a) renames only the epic's titles; the main branch keeps its own** — `check-specs` does not see a
  title left with an old number, since the number stays valid for the main scenario. Epic files:
  `sheet-header-cards` scenarios and bindings, `rt-dynamic-selector-sheet.spec.ts` (1780),
  `rt-autocomplete-sheet.spec.ts:172` (1781), `rt-table-filter-header.component.spec.ts:295` (1782),
  `rt-select-sheet.spec.ts:396–437`, `rt-bottom-sheet-focus.spec.ts:204`, `rt-bottom-sheet.logic.spec.ts:12,19`
  (1783), `rt-page-bar.component.spec.ts:146` (1784), `auth/theme` and `language-sheet.spec.ts:11`
  (SC-AUTH-121), `admin-shell` scenario at :39 and `shell.narrow.spec.ts:37` (SC-MB-458). Main files left as
  they are: `tokens`, `rt-scope-styles.service.spec.ts`, `tools/tests/build-tokens-split.test.sh`,
  `popover-sheet-lazy`, `rt-popover-sheet-lazy*.spec.ts`, `auth/example` with `entry.spec.ts`,
  `admin-shell` scenario at :186 with `shell.spec.ts`. After the step the same grep finds only the main
  files. `pnpm run check:unused` runs after stage 3. Next after this task: the push of the epic branch and
  the PR of the epic into the main branch, whose pipeline shoots the whole showcase. Affected stage of the
  plan: 2, 3.
- `projects/ui-kit-v2/src/lib/components/date-picker/stories/component/test-rt-date-sheet.component.ts` — превышение решения плана: файл обёртки витрины переименован из `test-date-sheet.component.ts` по имени своего класса, нового символа нет; без этого Angular Doctor красный.
- `projects/ui-kit-v2/src/lib/components/date-picker/stories/component/test-rt-date-sheet.component.spec.ts` — превышение решения плана: тест обёртки витрины, которого требует Angular Doctor; нового символа кита нет.
- **Round one of the review: qa-engineer, goal-critic, product-strategist** — fixed: the wrapper spec titles
  borrowed SC-UKV-1760 and checked none of its Then — the frames get scenario SC-UKV-1919 of their own;
  the index row of `docs/specs/ui-kit-v2/scenarios.md` was wider than the formatter's table; the three
  spec histories lacked the renumbering. Written off: the record `docs/archive/RT-3617-sheet-owner-remarks.md`
  names SC-MB-458 — an archive record is not edited after the fact; the index rows of `tokens`,
  `snapshots` and `popover-sheet-lazy` came stale from the main branch and lie outside this work. Taken
  into piece (c): `tools/tests/check-kit-weight-live.test.sh` is red by the same growth (the set and its
  gzip both print a line) and turns green with the threshold; rerun `bash tools/tests/run.sh` after the
  decision. Taken into the epic: before the epic PR the main branch is merged in again —
  `projects/ui-kit-v2/CHANGELOG.md` conflicts with the 0.53.0 release, `[Unreleased]` stays above it; the
  local epic branch is pushed before the PR of this task, otherwise that PR shows the main branch's files.
- **Round two of the review: qa-engineer, goal-critic, product-strategist** — fixed: the wrapper spec told
  the three date kinds apart by the tag alone — it now reads `type()`, `timeStart()` and the form model of
  each frame and the label of its `rt-field`, 4 of 4; the Covered line of SC-UKV-1917 now names
  `rt-bottom-sheet-focus.spec.ts`. Written off: `prettier --check` flags the plan — a plan is not edited
  after its commit. product-strategist: the push set without the weight steps is green — 27 node steps,
  the kit suite 4740 of 4740, Angular Doctor, knip; `tools/tests/run.sh` is red only by
  `check-kit-weight-live`, which waits for the weight decision.
- **The way for the kit weight: the owner chose «В этой же задаче»** — the weight is cut inside RT-3706: the
  executor finds what of the sheet code can move to the lazy load and shows the owner a plan before the
  code. Piece (c) becomes that work; the threshold is not rewritten.
- **Цена:** нет
- **Отменено:** нет

## Sessions

### 2026-11-26

- The task came out of the merge of the main branch into the epic RT-3530: four sheet specs of the epic
  fail after RT-3645 made the sheet code load at the first opening.
- The owner approved the plan: «Одобряю план». The way for the kit weight is not named yet.
