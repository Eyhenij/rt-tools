# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — The question screen arrives at the first question
- **Done:** all four steps. The start set 218731 → 206521 bytes, gzip 53502 → 51655; the part radio-button
  left the start set, bottom-sheet 24268 → 20436, select 38920 → 39233. The kit suite exit 0.
- **Next step:** the showcase snapshots of the sheets (`node tools/visual-gate.mjs ui-kit-v2 --affected
  RT-3530-phone-sheets`), the owner's word on the remainder of 20721 bytes over 185800, then the review.
- **PR:** not open yet

## Steps

- [x] 1.1 Move the question screen of the sheet into its own component, loaded at the first question, with a preload for the specs
- [x] 2.1 Draw the radio of a select card in a deferred block that prefetches on idle
- [x] 3.1 Measure the start set
- [x] 3.2 Run the whole kit suite

## Decisions along the way

- **The reading of the plan by goal-critic and product-strategist** — taken, as a stage revision before the
  approval (the plan file stays as its commit holds it): the growth by parts — bottom-sheet +17101,
  radio-button +8825, select +3494, popover +2692; the two moves cut the radio part whole and the question
  screen of bottom-sheet, an estimate of 3000–5000 bytes, so the set lands near 205000–210000, still above
  185800 by about 20000. The check is red on any divergence, a lowering too (`tools/check-kit-weight.mjs:205-245`),
  so the remainder needs the owner's word before the code: the threshold by `--write` or more tasks of
  the chain for the second screen, the keyboard lift, select and popover. Step 3.1 is read by parts too: no
  part `radio-button` in `--print`, `bottom-sheet` below 24268. Stage 2 adds the showcase snapshots of the
  sheets: `node tools/visual-gate.mjs ui-kit-v2 --affected RT-3530-phone-sheets`; the deferred radio gets a
  placeholder of its size, so the first frame keeps its look. The kit files of the change: `bottom-sheet/index.ts`,
  `rt-bottom-sheet.component.{ts,html,scss}`, the two new files of the question screen, `select/rt-select.component.html`;
  the owner's no-look word is asked with the approval. RT-3709 is delivered in the same chain right after
  RT-3706, its PR into the epic stands on RT-3706. Affected stage of the plan: 2, 3.
- **Stage 1 measured** — `pnpm run check:kit-weight -- --print`: bottom-sheet 24268 → 20436, the set 218731 →
  214990, gzip 53502 → 53173. The question screen lives in its own chunk. Превышение бюджета:
  `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-confirm.loader.ts` — 105 lines against up to 40:
  the place of the screen moved there from the sheet, which stood at 505 lines against the limit 500; the
  answers reach the sheet through `RT_SHEET_CONFIRM_ANSWERS` in `rt-bottom-sheet.model.ts`, not by
  subscriptions — the tree forbids a subscription inside a method. Six spec files wait for the question code
  by `rtPreloadSheetConfirm()`; `rt-aside-sheet.styles.spec.ts` reads the question rules from the new styles
  file. Affected stage of the plan: 1.
- **Цена:** нет
- **Отменено:** нет

## Sessions

### 2026-11-26

- The task came out of RT-3706: the owner chose to cut the kit weight «В этой же задаче»; the plan of
  RT-3706 is not edited after its commit, so the work is the next task of the chain, from the tip of
  RT-3706 with the main branch merged into the epic (`e7009520e`).
- The owner: «если недельный лимит достигнет 99 процентов останавливайся».
