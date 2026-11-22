# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — texts and the built declarations, done
- **Done:** all five steps matched; the live check and two review rounds with their fixes; the
  kit's unit tests 4132 of 4132 green
- **Next step:** the last live check, then the folder taken apart, the push set and the PR
- **Uncommitted:** none after the round commit
- **PR:** not open yet

## Steps

- [x] 1.1 Emit `selectionChange` from the date range field on a pick, typing and the cross
- [x] 1.2 Emit `selectionChange` from the multiselect on a pick, a removed chip and the cross
- [x] 1.3 Emit `selectionChange` from the date picker on a pick, typing and the cross
- [x] 2.1 Name the event in the «Выходы» tables of the three fields
- [x] 2.2 Check the built declarations of the three fields

## Decisions along the way

- **The task goes under the epic RT-3497 of one task** — the engine has no path for work outside an
  epic, and code stays closed without one. The owner's word: «Да, эпик под RT-3496». The task PR
  goes into the epic branch, then the epic PR into `main`. Affected stage: none.
- **On the cross the event carries the field's value after `super.clear()`, behind an
  `isDisabled()` guard** — the empty value of the date field is `''` and of the multiselect `[]`,
  so a constant `null` as in `rt-select` would differ from what the form gets. Affected stage: 1.
- **The two date fields get a signal form case** — the owner's reason is a signal form model fed
  from a store, so the spec sets that model from outside and expects no event. Affected stage: 1.
- **The version is raised by the publish workflow with `minor`** — the workflow bumps it itself,
  a bump in the PR would make it twice. Affected stage: none.
- **The merge and the release follow the PR** — the owner's word «затем выпусти кит»; the merge
  needs the owner's word about this PR. Affected stage: none.
- **Round one: a handler that hands the form back its old value left the typed text in the field**
  — confirmed by a spec of both date fields. `writeValue` now writes its own text into the field,
  and the event goes after the text is accepted. Affected stage: 1.
- **Round one: the multiselect got a signal form case and the three overviews a usage line with
  `(selectionChange)`** — the same reason as the date fields; `rt-select` shows its event in the
  usage sample. Affected stage: 1, 2.
- **Round one, written off: an event on a value equal to the previous one, and on a branch of only
  disabled leaves** — the event carries exactly what goes to the form's `onChange`, the owner's
  requirement; `rt-select` emits on a repeated pick too. Affected stage: none.
- **Round one, written off: the disabled guard returns before `stopPropagation`** — the sample
  `rt-select` does the same, and a disabled field shows no cross. Affected stage: none.
- **Round two: the text is accepted before the form gets the value, and `writeValue` rewrites the
  field only when its text differs** — a `valueChanges` subscriber that handed back the old value
  was overwritten by the typed text, and the first fix wiped a half-typed text on a value with the
  same text. Both are held by specs now. Affected stage: 1.
- **Round two, beside the subject: a rejection on signal forms** — a handler that sets the model
  back in the same pass gets no `writeValue` from Angular's `FormField`, so the field keeps the
  person's text; `rt-select` behaves the same, and the owner asked for no rejection. The round-one
  fix holds for a reactive form only. Named in the PR body. Affected stage: none.
- **Round two, beside the subject: a field disabled while its panel is open still takes a pick** —
  it was so before the change; the two date fields do not close the panel in `setDisabledState`.
  A task of its own. Affected stage: none.

## Sessions

### 22.11.2026

- The plan approved by the owner («Одобряю план RT-3496»); `plan-red` showed all five checks red.
- The epic RT-3497 declared for this one task; its branch is pushed, the task card is its sub-issue.
- Live check in the showcase on port 6007, the stories `Playground` of the three fields, through
  the component instance: `writeValue` gave 0 events at each field. Typing, a panel pick, a removed
  chip and the cross gave events equal to the form values: the range 2 of 2, the date 3 of 3, the
  multiselect 3 of 3, and the multiselect passes the same array. After round one, on a reactive
  form, a handler that hands back the old value leaves «10.03.2026» and «12.10.2026 — 15.10.2026».
- Mutation check: without `emit` in `#commit` the range spec fails 4 of 7.
- Last live check after round two, the range field: a form subscriber handing back the old value
  leaves «12.10.2026 — 15.10.2026»; a value with the same text keeps «12.10.2026 — 1»; typing still
  gives an event equal to the form value.
