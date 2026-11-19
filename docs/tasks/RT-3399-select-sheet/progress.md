# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 из 4 — Mockup

### 1. Mockup

1. [x] Draw the frames of both fields in the sheet at 375 in the kit's Figma file: single choice, multiple choice, with search. — the frames already stand in the file: `Телефон · Select` (6068:811), `Телефон · Select, дерево` (6068:895), `Телефон · Multiselect` (6068:1250), built on `Bottom Sheet` and `Sheet Content / Select…`; all 375×812, search in each, the multiselect sheet has the footer «Выбрано: N · Сбросить · Готово».
2. [ ] Measure the frames by the pattern `mockups-measure`.
3. [ ] Show the frames to the owner and write the approval into `approvals.md`. ← going on — the frames are shown, waiting for the answer.

- **Waiting for the owner:** «1 А» — the approval of the three existing frames.

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

- The menu and the select with a toggles panel are tasks of their own (grill, Decisions); filing
  them waits for the owner's word.
