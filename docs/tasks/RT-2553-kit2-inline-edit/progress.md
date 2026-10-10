# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Snapshots and delivery
- **Done:** the subdomain spec with scenarios SC-UKV-786–792; the component, its model, logic and
  styles; fifteen specs; seven stories, the overview page and the folder note. The look on :6007 is
  measured, and six references are taken. On 9 October the epic branch with a fresh main went in
  again, and four icon frames were retaken for the added `folder`. The whole snapshot set passed,
  844 frames of 844, and so did the kit tests and the linter.
- **Next step:** the push and the PR into the epic branch after the owner's word.
- **Uncommitted:** no
- **Waiting for the owner:** «пры не открывай откроеш после моего апрува» — the push and the PR wait
  for the owner's approval in the morning.
- **PR:** not open

## Decisions along the way

- The applications' samples, read before the spec. The first application's badge is a field all the
  time: focus selects the text, Enter and leaving save, Escape restores, an empty value goes back
  silently. The same wiring is copied by hand into a page title. The second application opens a
  field with «Save» and «Cancel» under a settings row, the save unavailable for an empty value,
  without keys. Neither is a component of the kit, and the kit holds the pattern only inside the
  editable list rows.
- The draft lives in a form control, not in a two-way binding: the binding wrote the value into the
  field a tick after the first render, and the select-all on opening found an empty field.
- Leaving the field keeps it open by default; the first application's way — save on leaving — is the
  input `blurAction="save"`.
- The measurement on :6007 found two defects, both fixed. The badge took the action colour on a light
  plate, a contrast of 4.0 and 3.4 for small text; it now takes the neutral `rt-tag` colours, and an
  empty badge is muted. A field disabled while saving dropped the focus onto the page, and it now
  comes back to the field on a refusal and to the value on closing.
- Colours, gaps and the badge became `--rt-inline-edit-*` properties with the former steps as
  defaults. The material preset reassigns five of them after the application's badge, and the badge
  text stays the primary colour for contrast. The owner's words: «все переносимые компоненты из апки
  должны иметь базовую вьюху кита + материальную но без использования пакетов материал, стили должны
  быть заданы через токены чтобы поддавались модификации из апки + необходимые входы».
- On 10 October a live comparison showed that the application cannot move onto the kit without its
  badge: the badge is the field, grows with the text up to 384px, saves on Enter and on leaving,
  reverts on Escape and reverts an empty value silently. A new look `chip-field` carries it, so the
  default `text` and the `chip` look keep the field with buttons. A new input `fieldIcon` names the
  icon on the left. Four rules with scenarios SC-UKV-831–834 and seven specs were added. The width
  comes from a hidden copy of the text in one grid cell with the field. The material colours are
  `--rt-mat-neutral-5`, `--mat-sys-primary-fixed-dim` and `--mat-sys-primary`, with kit fallbacks.
  The story ChipField shows the look in both presets. The middle truncation of the application is
  not carried over: the kit scrolls the text and shows it whole in a tooltip. Affected stage: 4.

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Read the application's component and write what it does into the progress
- [x] 1.2 Write the subdomain spec, scenarios and bindings for the inline edit
- [x] 2.1 Write the component, its model and styles in the components layer
- [x] 2.2 Write the specs on the rest, the edit, the keys, the save and the cancel
- [x] 3.1 Write the overview page, the matrix stories and the playground
- [x] 3.2 Measure the layout on :6007
- [x] 4.1 Take the references of the new stories after looking at them
- [>] 4.2 Run the whole set and open the PR into the epic branch after the owner's word
