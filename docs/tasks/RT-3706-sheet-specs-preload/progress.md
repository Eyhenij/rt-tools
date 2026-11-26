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
- **Цена:** нет
- **Отменено:** нет

## Sessions

### 2026-11-26

- The task came out of the merge of the main branch into the epic RT-3530: four sheet specs of the epic
  fail after RT-3645 made the sheet code load at the first opening.
