# Progress

## Where we stand

- **State:** `договорённость-записана`
- **Stage:** 1 of 4 — Specs wait for the sheet code
- **Done:** the grill and the plan are written; the red baseline is measured: 4 failed, 38 passed of 42;
  check-specs 7 divergences; Angular Doctor 2 new findings; kit weight 185800 → 218731.
- **Next step:** the owner approves the plan and names the way for the kit weight, then 1.1.
- **PR:** not open yet

## Steps

- [>] 1.1 Add `await rtPreloadPopoverSheet()` in `beforeAll` of the four sheet specs
- [ ] 2.1 Renumber the epic's colliding scenarios and their test titles
- [ ] 3.1 Rename the date sheet wrapper by its class and give it a spec
- [ ] 4.1 Bring the kit weight and its threshold together by the way the owner names
- [ ] 4.2 Run the whole kit suite

## Decisions along the way

- **The plan grew from one stage to four after the reading by the roles** — `product-strategist` found
  three more red steps of the push set after the merge: scenario numbers, Angular Doctor, kit weight.
  Affected stage of the plan: all.
- **Step 2.1 renames only the epic's titles; the main branch keeps its own** — `check-specs` does not see a
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
