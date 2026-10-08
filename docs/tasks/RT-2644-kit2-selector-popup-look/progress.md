# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 5 of 5 — Whole set and delivery
- **Done:** stage 1 — row 92: the kit linter is clean, the Popup frame retaken (1 updated, 11
  matched); the second run comes with the whole set in stage 5. Stage 2 — row 93: `searchRadius`
  in the popup, the selector and the kit settings; selector specs 68 of 68. Stage 3 — row 94:
  `highlightSearch` and the two highlight properties. Kit specs: 210 suites green. The Popup frame
  is retaken with two highlight cases (1 updated, 11 matched). On :6007 the matched characters
  stand at weight 600 against 400. A single-line label stays 18px high and cut. Default popup
  heights are unchanged: 360, 392, 363, 323, 195, 298. Stage 4 — row 95: `applyLabel` and
  `applyLabelCase`, selector specs 79 of 79. On :6007 the default button reads «Применить» at 134px
  as before; the new cases read «Отправить Выбор» and «ПРИМЕНИТЬ». Rows 94–95 are committed in
  301460f8e. Rows 96–99: `autofocusSearch` and four popup properties, selector specs 80 of 80. On
  :6007 the defaults keep the rows at 36px, the gap at 12px and the footer at `8px 16px 0`. The
  Popup frame matched unchanged; the Look frame is retaken with the tuned properties.
- **Next step:** build the package to the desktop and open the PR into main.
- **Uncommitted:** no
- **Waiting for the owner:** nothing — rows 96–99 arrived.
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Settle the lint finding of the single-choice label
- [x] 1.2 Retake the Popup frame after looking at it
- [x] 2.1 Add `searchRadius` to the popup, the selector and the kit settings
- [x] 2.2 Write its spec scenario and test
- [x] 3.1 Split an option label into matched and plain parts by a pure function
- [x] 3.2 Draw the matched parts with the highlight properties and keep the ellipsis
- [x] 3.3 Write its spec scenario and tests
- [x] 4.1 Add `applyLabel` and `applyLabelCase` to the popup, the selector and the kit settings
- [x] 4.2 Write its spec scenario and test
- [x] 5.1 Run the whole set and the snapshots, measure on :6007
- [>] 5.2 Build the package to the desktop and open the PR into main

## Decisions along the way

- Rows 96 and 97 came from the application's session: the search field takes focus on opening
  (`autofocusSearch`, default `false` — the application agreed), and the option line height and
  minimum height become properties. The owner sent them into this task together with rows 98 and
  99: the gap of the empty result and the footer padding become properties. All four default to
  today's look and are done before step 5.1 closes.
- The popup minimum-height scenario of row 91 took SC-UKV-726, and the dense toolbar of RT-2639
  took the same number in main first: the spec check in main refuses. The row 91 scenario is
  renumbered SC-UKV-729 here; it has no test, only the heading moves.
- Matched characters are drawn semibold, and semibold glyphs are wider. In the narrow half of the
  showcase a label that fit on one line wraps once the highlight is on. The colour and the weight
  are properties: a caller who wants no width change sets the regular weight.
- The popup styles grew to 9.05 kB, past the 8 kB budget for one component style in the production
  builds of three applications. The row and option rules moved to a second style file of the
  popup; the main one builds at 6.77 kB. No rule changed, and the Popup frame stays the reference.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-2644-kit2-selector-popup-look

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 5 of 5 — Whole set and delivery
- **Next step:** build the package to the desktop and open the PR into main.
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2644-kit2-selector-popup-look/progress.md`; the plan lies next to it.

### Uncommitted

```
 M projects/ui-kit-v2/src/lib/components/dynamic-selector/popup/rt-dynamic-selector-popup.component.html
 M projects/ui-kit-v2/src/lib/components/dynamic-selector/popup/rt-dynamic-selector-popup.component.scss
 M projects/ui-kit-v2/src/lib/components/dynamic-selector/popup/rt-dynamic-selector-popup.component.ts
 M projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.logic.spec.ts
 M projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.logic.ts
 M projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.model.ts
 M projects/ui-kit-v2/src/lib/config/rt-kit-config.model.ts
```

### Commits over the main branch

```
425534564 feat(rt:ui-kit-v2): поле поиска окна выбора берёт шаг скругления из входа и настроек кита
a803e36b1 feat(rt:ui-kit-v2): подпись пункта окна выбора идёт одной строкой, когда перенос выключен
d22f0c24d docs: папка задачи RT-2644 и назначение копии
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
