# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 5 of 6 — Showcase and match
- **Done:** the agreement committed; in Figma each Calendar frame got its own panel surface, the mockup approved; the year logic and both panels have the grids, SC-UKV-1146–1154 green, stories Years and Months added
- **Next step:** the owner decides how the grids are matched to Figma: the existing panels are narrower than the frames
- **Uncommitted:** no
- **Waiting for the owner:** the choice of how the grids are matched to the Figma frames
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
- [>] 5.1 Add the new views to the panel matrix stories and take their snapshots
- [ ] 5.2 Measure the showcase against the Figma frames and record the match line
- [ ] 5.3 Show the showcase to the owner and record the second approval
- [ ] 6.1 Merge the agreement into the domain specs
- [ ] 6.2 Take the task folder apart into the archive record

## Decisions along the way

- **The branch stands on `RT-3041-branch-signature-human`** — from the main branch the branch guard
  does not accept the owner's signature yet; the fix waits in PR #3042. Affected stage of the plan: none.

- **The Figma page was tidied at the owner's word** — «поправь макет сейчас все кадры под одним фоном», «макет темной темы сделай отступы как на макете светлой темы», «Calendar Day сделай нормальный понятный макет, добавь аннотации с пояснениями краткими». Affected stage of the plan: none.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-2895-calendar-year-grid

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 5 of 6 — Showcase and match
- **Next step:** the owner decides how the grids are matched to Figma: the existing panels are narrower than the frames
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2895-calendar-year-grid/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/tasks/RT-2895-calendar-year-grid/progress.md
?? docs/specs/ui-kit-v2/proposed/calendar-year-grid/
```

### Commits over the main branch

```
320ce21f1 docs: папка задачи RT-2895 и строка назначения копии
59998db7b chore: строка копии в таблице назначений возвращена к главной ветке
27c69ab0a docs(rt:agent-kit): сценарии заведения ветки укладываются в предел длины файла
b65558967 docs: папка RT-3041 разобрана в запись архива
861468d41 chore: адрес владельца в списке людей, подписывающих коммиты
37dd58795 fix(rt:agent-kit): заведение ветки принимает подпись человека из RT_HUMAN_EMAILS
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
