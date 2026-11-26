# Progress

## Where we stand

- **State:** `разбор-кончился`
- **Stage:** 3 of 3 — closed; the sheet spec names the lazy question and the card radio
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
- `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-unsaved.spec.ts` — отказ от названных в плане
  сценариев SC-UKV-1757, SC-UKV-1761, SC-UKV-1795 в этом наборе: план назвал набор по памяти, а сценарии живут в
  `rt-bottom-sheet-focus.spec.ts` (1757), `rt-date-picker-sheet.spec.ts` (1761) и `rt-multiselect-sheet.spec.ts`
  (1795); этот набор держит SC-UKV-1785…1787 вопроса перед закрытием; все пять наборов зелёные.
- `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-confirm.loader.ts` outgoing 0 → 2 — превышение:
  загрузчик берёт ещё модель шторки ради токена ответов `RT_SHEET_CONFIRM_ANSWERS`, без подписок в методе.
- **Цена:** нет
- **Отменено:** нет

## Sessions

### 2026-11-26

- The task came out of RT-3706: the owner chose to cut the kit weight «В этой же задаче»; the plan of
  RT-3706 is not edited after its commit, so the work is the next task of the chain, from the tip of
  RT-3706 with the main branch merged into the epic (`e7009520e`).
- The owner: «если недельный лимит достигнет 99 процентов останавливайся».

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-3709-sheet-code-lazy-weight

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — The question screen arrives at the first question
- **Next step:** the showcase snapshots of the sheets (`node tools/visual-gate.mjs ui-kit-v2 --affected
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3709-sheet-code-lazy-weight/progress.md`; the plan lies next to it.

### Uncommitted

```
none
```

### Commits over the main branch

```
41fc86ffe docs(rt:ui-kit-v2): ход RT-3709 называет расхождения с решением плана — сценарии в своих наборах, связь загрузчика с моделью (RT-3709)
f34ada95e docs(rt:ui-kit-v2): ход RT-3709 — этапы закрыты, стартовый набор 206521 байт, набор кита зелёный (RT-3709)
5100a0086 perf(rt:ui-kit-v2): радиокнопка карточек выбора приходит с первыми карточками, а не со стартом (RT-3709)
f717efb3d docs(rt:ui-kit-v2): ход RT-3709 — вопрос шторки снял 3741 байт стартового набора (RT-3709)
a4e53bc13 perf(rt:ui-kit-v2): экран вопроса шторки — свой компонент, его код приходит при первом вопросе (RT-3709)
b96eff3be docs(rt:ui-kit-v2): разбор, план и одобрение RT-3709 — экран вопроса шторки и радиокнопка карточек грузятся при первом показе (RT-3709)
c313a6615 chore(rt:agent-kit): ветка эпика RT-3530 со свежей главной влита в RT-3706
e7009520e chore(rt:agent-kit): главная влита в ветку эпика RT-3530, раздел «Unreleased» журнала кита стоит над выпуском 0.53.0
3069077aa docs(rt:ui-kit-v2): ход RT-3706 записывает выбор владельца — вес кита снижается, порог не переписывается (RT-3706)
759326ec8 test(rt:ui-kit-v2): правки RT-3706 после второго круга ревью (RT-3706)
1065a9497 test(rt:ui-kit-v2): правки RT-3706 после первого круга ревью (RT-3706)
7689b9568 docs(rt:ui-kit-v2): ход RT-3706 называет два файла обёртки шторки даты превышением решения плана (RT-3706)
499b509c0 docs(rt:ui-kit-v2): ход RT-3706 — спеки шторок, номера сценариев и обёртка даты зелёные, вес кита ждёт слова владельца (RT-3706)
b029d198f test(rt:ui-kit-v2): обёртка витрины шторки даты названа по своему классу и получила тест кадров (RT-3706)
f08ac3b7e test(rt:ui-kit-v2): сценарии эпика, совпавшие с главной, получают свободные номера — UKV-1914…1918, AUTH-123, MB-460 (RT-3706)
d51cd0b50 test(rt:ui-kit-v2): четыре спеки шторок эпика ждут подгрузки кода шторки, как спеки главной (RT-3706)
d1c5ee004 docs(rt:ui-kit-v2): ход RT-3706 называет файлы эпика и главной для смены номеров (RT-3706)
1625625aa docs(rt:ui-kit-v2): план RT-3706 после чтения ролями — четыре красных шага набора после слияния (RT-3706)
adbc3ef5b docs(rt:ui-kit-v2): разбор и план RT-3706 — спеки шторок ждут подгрузки кода шторки (RT-3706)
f64fa65e7 chore(rt:agent-kit): главная влита в ветку эпика RT-3530, шторка popover и асайд сведены с RT-3645 и RT-3648
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
