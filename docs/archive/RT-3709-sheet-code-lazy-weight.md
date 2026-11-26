# RT-3709 — perf(rt:ui-kit-v2): код вопроса шторки и радиокнопки карточек приходит при первом показе (RT-3709)

Задача RT-3709, запись от 2026-11-26. Прежний адрес: `docs/tasks/RT-3709-sheet-code-lazy-weight/`.

## Согласия владельца по киту

### Approvals

- **Без вида:** «Одобряю, вид не меняется»

## Шапка разбора

Work begun from no cargo: the task came out of RT-3706, the repair of the epic RT-3530 after the merge
of the main branch; the kit weight check stayed red there.

## The owner request

> продолжай работу над основным эпиком

> В этой же задаче

The second is the owner's choice to the question «Как уменьшать вес?» with the option «В этой же задаче —
RT-3706 расширяется: я ищу, что из кода шторок можно вынести в ленивую загрузку, и показываю вам план».
The plan of RT-3706 is not edited after its commit, so the work goes into this task of the chain, from the
tip of RT-3706.

## Questions and answers

**Как уменьшать вес?**
В этой же задаче

## Решения разбора

- **The question screen moves into a component of its own, loaded at the first question, with a preload
  for the specs** — the same way as the popover sheet. Rejected: `@defer` in the template of the sheet —
  a second way of laziness in the kit, and its specs would wait differently from the sheet specs.
- **The radio button of the select cards is drawn by `@defer` that prefetches on idle** — one radio per row
  cannot be created imperatively without a second template of the row. Rejected: dropping the kit radio
  from the cards — a change of look the owner approved otherwise.
- **The threshold is lowered by `--write` to the measured weight only after the measurement.** A remainder
  above 185800 goes to the owner with its numbers.

## What is left unclear

- How much each move cuts is known only after the measurement; the plan names an upper bound.

## Решения по ходу

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
- `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-confirm.loader.ts` outgoing 0 → 3 — превышение:
  загрузчик берёт модель шторки ради слов вопроса и внутренний файл `rt-bottom-sheet-confirm.answers.ts` ради токена
  ответов `RT_SHEET_CONFIRM_ANSWERS`, без подписок в методе; токен вынесен из модели, чтобы не уйти в точку входа кита.
- `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-confirm.loader.ts` — превышение бюджета: 114 lines
  against up to 40 — after round one the place also takes the question off on a failed load and stops drawing after
  the sheet is gone; the sheet file stays at 500 lines.
- `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-sheet-confirm-place.ts` outgoing 0 → 4 — превышение: the place
  moved out of the loader into a file of its class name takes the type of the question screen, the internal answers
  token, the loader and the words of the sheet model; the loader keeps only the load.
- `projects/ui-kit-v2/src/lib/components/bottom-sheet/confirm/rt-bottom-sheet-confirm.component.ts` outgoing 0 → 3 —
  превышение: the question screen moved into its own folder `bottom-sheet/confirm/`, so the check of the showcase
  pages (`tools/verify-ui-kit-v2-docs.cjs`) stops reading its internal inputs `labels` and `titleId` as inputs of
  `rt-bottom-sheet`; it takes the core directives, the answers token and the words of the sheet model.
- `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-confirm.component.ts:RtBottomSheetConfirmComponent`
  — отказ от места плана: the class lives in `bottom-sheet/confirm/`, the check of the showcase pages read its
  internal inputs as inputs of `rt-bottom-sheet`.
- `projects/ui-kit-v2/src/lib/components/bottom-sheet/confirm/rt-bottom-sheet-confirm.component.ts` — превышение: the
  new place of the question screen, `RtBottomSheetConfirmComponent`, moved out of the plan's path by the same reason.
- **Правки после первого круга ревью** — qa-engineer, goal-critic, product-strategist. Fixed: a failed load of the
  question code left the sheet inert (now `stay()`, SC-UKV-1920); a sheet removed mid-load drew the question on a
  dead slot (`RtSheetConfirmPlace.destroy`); the prefetch also starts for a sheet with `confirmLabels` (the aside asks
  by `ask()`); the radio placeholder keeps the 16 px of the radio; `prefetch on idle` as the decision named; the answers
  token left the kit's entry; `check:specs` bound the focus to the moved `confirmFirst`. Written off: no
  `aria-describedby` on the question — the template of RT-3706 had none, outside this task. Weight after the fixes
  206874 bytes (+353: select +109, bottom-sheet +207, the rest the build), written by `--write` under the owner's
  «Увелич лимит». The new numbers are named in the kit changelog; the token growth of the epic (`tokens.css` +6261,
  `tokens.scope.css` +5232, `tokens.base.css` +1029) goes into the PR body.
- **The showcase snapshots of the sheets, two runs** — `node tools/visual-gate.mjs ui-kit-v2 --affected
  RT-3530-phone-sheets`. Run one: 674 of 674 frames match, 10 tests red with «Target crashed» in
  `page-header-vertical.stories.ts` and `popover.stories.ts`. Run two (466 s): 640 of 642 frames match, 27 tests red,
  in `page-header-vertical`, `chat-matrix` and `ai-chat-section-matrix`: `globalThis.__getContext is not a function`,
  a retry after navigation, two frames 768 px wide against 1280. The red files differ between the runs, and two of them
  draw no sheet; no compared frame of a sheet diverged. The step is stopped after the second red by the owner's word
  about repeated failures; the cause is not proven.
- **The remainder of 20721 bytes over 185800** — the owner: «Увелич лимит». `pnpm run check:kit-weight -- --write`
  wrote the threshold 206521 bytes, gzip 51655, in `tools/kit-weight-threshold.json`.
- **Правки после второго круга ревью** — qa-engineer, goal-critic. Fixed: one failed load answered «stay» once per
  waiting question and reached the error handler twice — now one wait per place, the prefetch stays silent, the
  question names the failure once (the failure spec asserts one error and one answer after Escape and a second
  question); the radio placeholder now measures the loaded mark — the indicator and its rim on both sides — by the
  modifier `rt-select__mark--pending`, and the loaded radio takes no size from it; `prefetch on idle` dropped as empty;
  the spec history says the code arrives when a sheet that can ask opens, and keeps «the look is unchanged». Not
  changed: the order of the two tests in `rt-bottom-sheet-confirm-lazy.spec.ts` is fixed by a comment, the kit's jest
  does not shuffle tests. The placeholder size is computed from the styles, not measured in a browser: the showcase is
  not running. The push set named four more: the question screen had no story binding — it is shown by
  `Organisms/Aside/AsideSheet › UnsavedQuestion`, written in `shownWithin` of `tools/kit-coverage-allowlist.json`;
  it had no spec of its own — `rt-bottom-sheet-confirm.component.spec.ts`; the place class lived in a file of another
  name — moved to `rt-sheet-confirm-place.ts`, the loader keeps the load; `rtLoadSheetConfirm` was exported for nobody
  — the place now imports it; the placeholder size took `calc` — now the step `--rt-size-5` (20px). Weight 207053
  bytes, gzip 51785, written under the owner's «Увелич лимит»; 532 bytes over the 206521 shown to the owner, named in
  the reply. Превышение бюджета: new code files 4 against the plan's 2 — `rt-bottom-sheet-confirm.answers.ts` keeps
  the token out of the kit's entry, `rt-sheet-confirm-place.ts` gives the place a file of its name.
- **The push set red on SC-AK-1946** — `projects/agent-kit/tests/combined-command-refusal.test.sh` expects `/tmp/x` to be
  absent; an empty directory `/tmp/x` of 24.11 made `cp tools/laid.mjs /tmp/x` write `/tmp/x/laid.mjs`. Red on a
  clean copy of main too. The owner: «Удали и продолжай, после того как откроеш пр заведи тикет но не бери его!» —
  `rmdir /tmp/x`; after the PR of RT-3709 a task is filed for the test that depends on a path outside its fixture,
  and it is not taken.
- **Цена:** нет
- **Отменено:** нет

## Цитаты из разбора и хода работы

- The task came out of RT-3706: the owner chose to cut the kit weight «В этой же задаче»; the plan of
  RT-3706 is not edited after its commit, so the work is the next task of the chain, from the tip of
  RT-3706 with the main branch merged into the epic (`e7009520e`).

- The owner: «если недельный лимит достигнет 99 процентов останавливайся».

## Одобрение плана

«Одобряю, вид не меняется»

## Чем подтверждено

- Ревью прошло два круга. В первом было 2 серьёзные находки, поэтому второй круг был обязателен по команде `review-path.mjs --round-two --serious 2`. Все подтверждённые находки исправлены.
- Отсутствие `aria-describedby` у вопроса не исправлено: его не было и до задачи.
- Сценарий правил SC-AK-1946 падал из-за пустой папки `/tmp/x` на машине исполнителя. Папку удалили по слову владельца, а для теста, который зависит от пути вне своей временной папки, заведена отдельная задача.

## Оставшийся шаг

Цепочка вливается снизу вверх: PR RT-3706 в ветку эпика, затем этот.
