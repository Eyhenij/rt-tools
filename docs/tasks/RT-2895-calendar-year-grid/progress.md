# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 1 of 6 — Agreement
- **Done:** the agreement in `proposed/calendar-year-grid` committed; the Calendar frames got a panel surface each
- **Next step:** record the mockup approval, then stage 2
- **Uncommitted:** no
- **Waiting for the owner:** the approval of the Figma frames `6887:785` and `6887:524`
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Write the product agreement in `docs/specs/ui-kit-v2/proposed/calendar-year-grid/`
- [>] 1.2 Record the mockup approval in `approvals.md`
- [ ] 2.1 Add the year span, the year cells and their bounds to `rt-date-panel.logic.ts`
- [ ] 2.2 Cover them by unit tests with scenario numbers
- [ ] 3.1 Make the year in the month grid header a button that opens the year grid
- [ ] 3.2 Draw the year grid by the frame `6887:688` and cover the panel by tests
- [ ] 4.1 Give the range calendar a pressable month title opening the month grid
- [ ] 4.2 Draw the month and year grids by the frames `6887:721` and `6887:753` and cover them by tests
- [ ] 5.1 Add the new views to the panel matrix stories and take their snapshots
- [ ] 5.2 Measure the showcase against the Figma frames and record the match line
- [ ] 5.3 Show the showcase to the owner and record the second approval
- [ ] 6.1 Merge the agreement into the domain specs
- [ ] 6.2 Take the task folder apart into the archive record

## Decisions along the way

- **The branch stands on `RT-3041-branch-signature-human`** — from the main branch the branch guard
  does not accept the owner's signature yet; the fix waits in PR #3042. Affected stage of the plan: none.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-2895-calendar-year-grid

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 of 6 — Agreement
- **Next step:** record the mockup approval, then stage 2
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
