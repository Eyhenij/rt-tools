# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 5 of 6 — Showcase and match
- **Done:** the agreement committed; in Figma each Calendar frame got its own panel surface, the mockup approved; the year logic and both panels have the grids, SC-UKV-1146–1154 green, stories Years and Months added
- **Next step:** the owner approves the showcase; then the snapshots of the new stories
- **Uncommitted:** no
- **Waiting for the owner:** the showcase approval
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Write the product agreement in `docs/specs/ui-kit-v2/proposed/calendar-year-grid/`
- [x] 1.2 Record the mockup approval in `approvals.md`
- [x] 2.1 Add the year span, the year cells and their bounds to `rt-date-panel.logic.ts`
- [x] 2.2 Cover them by unit tests with scenario numbers
- [x] 3.1 Make the year in the month grid header a button that opens the year grid
- [x] 3.2 Draw the year grid by the frame `6887:688` and cover the panel by tests
- [x] 4.1 Give the range calendar a pressable month title opening the month grid
- [x] 4.2 Draw the month and year grids by the frames `6887:721` and `6887:753` and cover them by tests
- [x] 5.1 Add the new views to the panel matrix stories and take their snapshots
- [x] 5.2 Measure the showcase against the Figma frames and record the match line
- [>] 5.3 Show the showcase to the owner and record the second approval
- [ ] 6.1 Merge the agreement into the domain specs
- [ ] 6.2 Take the task folder apart into the archive record

## Decisions along the way

- **The branch stands on `RT-3041-branch-signature-human`** — from the main branch the branch guard
  does not accept the owner's signature yet; the fix waits in PR #3042. Affected stage of the plan: none.

- **The Figma page was tidied at the owner's word** — «поправь макет сейчас все кадры под одним фоном», «макет темной темы сделай отступы как на макете светлой темы», «Calendar Day сделай нормальный понятный макет, добавь аннотации с пояснениями краткими». Affected stage of the plan: none.

- **The mockup was redrawn as whole panels at the owner's word** — «На макетах недостаточно наполнения? Я же просил наполнить макет». The block «Панели кита» (`7523:2313`) draws both panels whole with every cell state. Its sizes are those of the live panels, and the match is taken against it. The snapshots move after the showcase approval. Affected stage of the plan: 5.

- **The match is taken from the outer edge of the panel** — «отличается от фигмы!!! отступы и бордеры я заметил!!!». The Figma frames drew the border inside, the showcase draws it outside the content. The frames grew by the border, the middle grid column and the period summary box took the browser sizes; 178 of 178 numbers. Affected stage of the plan: 5.

- **The side padding of both panels in the sheet joins this task** — «почему не включить в эту задачу?». In the sheet the panel drops its side padding, and the sheet body has none, so days and arrows touch the screen edge. The frames `7539:574` and `7539:595` draw both panels with 20px, the padding of the sheet header and footer. The code waits for the mockup approval. Affected stage of the plan: 5.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-2895-calendar-year-grid

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 5 of 6 — Showcase and match
- **Next step:** the owner approves the showcase; then the snapshots of the new stories
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2895-calendar-year-grid/progress.md`; the plan lies next to it.

### Uncommitted

```
none
```

### Commits over the main branch

```
23bfe97d9 docs: совпадение витрины RT-2895 с макетом 148 из 148
42deb65db fix(rt:ui-kit-v2): ячейки сеток месяцев и годов по ячейке периода макета
afe173a6f docs: привязки правил договорённости RT-2895 к коду
97d48575a docs: одобрение полного макета панелей RT-2895 и совпадение 44 из 44
c8cb6b63d feat(rt:ui-kit-v2): текущий месяц обведён в сетке месяцев панели даты
6c14b0615 feat(rt:ui-kit-v2): сетки месяцев и годов в панели выбора периода
ef970baf3 feat(rt:ui-kit-v2): сетка годов в панели выбора даты
f8410dae6 feat(rt:ui-kit-v2): логика сетки годов панели даты
aefd00eac docs: одобрение макета RT-2895, этап 2
3460ddea6 docs: прогресс RT-2895 — правки страницы календаря в Figma
14b53f62e docs: прогресс RT-2895 — договорённость готова, ждёт одобрения макета
0b926498a docs(rt:ui-kit-v2): договорённость о сетке годов и сетке месяцев выбора периода
320ce21f1 docs: папка задачи RT-2895 и строка назначения копии
59998db7b chore: строка копии в таблице назначений возвращена к главной ветке
27c69ab0a docs(rt:agent-kit): сценарии заведения ветки укладываются в предел длины файла
b65558967 docs: папка RT-3041 разобрана в запись архива
861468d41 chore: адрес владельца в списке людей, подписывающих коммиты
37dd58795 fix(rt:agent-kit): заведение ветки принимает подпись человека из RT_HUMAN_EMAILS
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
