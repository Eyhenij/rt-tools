# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 из 3 — Showcase
- **Done:** stage 1 — the unit, the points label and the «growth is worse» input, 28 tile tests
  green; the stories Unit and Growth are added, the dark tiles stand in Themes, and the colours are
  measured in both themes and both presets
- **Next step:** after the owner's word on the showcase — the approval line, the push gate set, the
  folder taken apart and the PR on RT-3041; the agreement is already merged into the kit spec
- **Uncommitted:** nothing
- **Waiting for the owner:** the showcase approval — stories Unit, Growth and Themes of
  Molecules/Data/StatTile
- **PR:** not open yet

## Steps

- [x] 1.1 Add the unit field to the delta model
- [x] 1.2 Add the points label to the kit labels
- [x] 1.3 Write the delta text by its unit
- [x] 1.4 Add the «growth is worse» input and the colour sense
- [x] 1.5 Cover SC-UKV-1125…1132 by unit tests
- [x] 2.1 Add the unit and the colour sense to the stories
- [x] 2.2 Check the stories by eye against the mockup
- [>] 2.3 Get the owner's word on the showcase
- [x] 3.1 Merge the agreement into the kit spec
- [ ] 3.2 Run the push gate set
- [ ] 3.3 Take the task folder apart and open the PR

## Decisions along the way

- **The branch is taken from RT-3041, not from the main branch** — the owner's mail in the signature
  list and the guard fix live there until it merges; from the main branch every commit of this task
  is refused.

## Sessions

### 2026-11-02

- The tile and the application's copy of it are read; four answers of the owner are in the grill.

### 2026-11-03

- The kit mockup is compared with the block «Примеры разницы» of the application's analytics
  mockups. Percent in the kit mockup is now written with a space, as the kit code writes it; a
  zero-points tile is added.
- The product agreement is written: scenarios SC-UKV-1125…1132.
- The owner approved the mockup. The agreement now hides a row with an unknown base, as the tile
  does today, instead of a dash; the plan is written.
- Stage 1 is closed: `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-stat-tile.component.spec.ts`
  gives 28 passed, typecheck and linters are clean. Scenarios 1129…1132 carry partial coverage: the
  colour is held by the styles and was measured in the showcase — growth red #dc2626 and a fall
  green #059669 under «growth is worse», in both themes and both presets.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-2927-rt-stat-tile-delta-unit

### Where we stand at the minute of the compaction

- **State:** `договорённость-записана`
- **Stage:** 0 — the plan is not written yet
- **Next step:** after the owner's word on the mockup — the plan
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2927-rt-stat-tile-delta-unit/progress.md`; the plan lies next to it.

### Uncommitted

```
none
```

### Commits over the main branch

```
676b62742 docs: договорённость RT-2927 — единица разницы и «рост хуже» у плитки
ad9d494f1 docs: макет плитки RT-2927 ждёт слова владельца
4bffa468e docs: разбор RT-2927 — единица разницы и признак «рост хуже» у плитки
27c69ab0a docs(rt:agent-kit): сценарии заведения ветки укладываются в предел длины файла
b65558967 docs: папка RT-3041 разобрана в запись архива
861468d41 chore: адрес владельца в списке людей, подписывающих коммиты
37dd58795 fix(rt:agent-kit): заведение ветки принимает подпись человека из RT_HUMAN_EMAILS
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
