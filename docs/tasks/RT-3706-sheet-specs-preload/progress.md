# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 4 — Specs wait for the sheet code
- **Done:** the owner approved the plan: «Одобряю план»; plan-red wrote the approval mark. The red
  baseline: 4 failed, 38 passed of 42; check-specs 7 divergences; Angular Doctor 2 new findings; kit
  weight 185800 → 218731.
- **Next step:** 1.1; the way for the kit weight (stage 4) waits for the owner's word.
- **PR:** not open yet

## Steps

- [x] 1.1 Add `await rtPreloadPopoverSheet()` in `beforeAll` of the four sheet specs
- [>] 1.2 Run the whole kit suite

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
- **Цена:** нет
- **Отменено:** нет

## Sessions

### 2026-11-26

- The task came out of the merge of the main branch into the epic RT-3530: four sheet specs of the epic
  fail after RT-3645 made the sheet code load at the first opening.
- The owner approved the plan: «Одобряю план». The way for the kit weight is not named yet.
