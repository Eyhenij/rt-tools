# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 из 4 — Mockup

### 1. Mockup

1. [x] Draw the frames of both fields in the sheet at 375 in the kit's Figma file: single choice, multiple choice, with search. — the frames already stand in the file: `Телефон · Select` (6068:811), `Телефон · Select, дерево` (6068:895), `Телефон · Multiselect` (6068:1250), built on `Bottom Sheet` and `Sheet Content / Select…`; all 375×812, search in each, the multiselect sheet has the footer «Выбрано: N · Сбросить · Готово».
2. [ ] Measure the frames by the pattern `mockups-measure`.
3. [x] Show the frames to the owner and write the approval into `approvals.md`. — «это ок».

### Stage revision — 19.11.2026

The owner widened the task: «все в этом тикете делать, везде где можно прикрутить ботомшит вид на
мобилке». The plan stays as written; each of its four stages now covers every component of the
set named in the grill, Decisions. Stage 1 gets the steps below for the components that have no
phone frame yet.

1. [ ] Find which components of the set already have a phone frame in Figma. ← going on
2. [ ] Draw the missing phone frames.
3. [ ] Show them to the owner and write the approval into `approvals.md`.

### 2. Agreement in the spec

1. [ ] Write the rules and scenarios of the sheet and of the input that switches it off into the select spec.

### 3. Code and unit tests

1. [ ] `rt-select`: the narrow sign, the sheet in the template, the switch-off input, the choice closes the sheet.
2. [ ] `rt-multiselect`: the same; the sheet stays open on a choice.
3. [ ] Unit tests by the scenarios of stage 2.

### 4. Showcase

1. [ ] Stories of both fields at the narrow width with the sheet open and with the sheet off.
2. [ ] Measure the showcase against the mockup with `node tools/kit-match.mjs numbers`.
3. [ ] Show the showcase to the owner and write the approval into `approvals.md`.

## Decisions along the way

- Every kit component with a drop-down panel goes into this task (grill, Decisions).
