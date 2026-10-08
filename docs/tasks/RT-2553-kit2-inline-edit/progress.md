# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — Showcase
- **Done:** the subdomain spec with scenarios SC-UKV-786–792; the component, its model, logic and
  styles; thirteen specs on the rest, the edit, the keys, the save, the cancel, the saving wait and
  leaving the field.
- **Next step:** the overview page, the matrix stories and the playground, then a measurement on
  :6007.
- **Uncommitted:** no
- **Waiting for the owner:** «пры не открывай откроеш после моего апрува» — the push and the PR wait
  for the owner's approval in the morning
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

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Read the application's component and write what it does into the progress
- [x] 1.2 Write the subdomain spec, scenarios and bindings for the inline edit
- [x] 2.1 Write the component, its model and styles in the components layer
- [x] 2.2 Write the specs on the rest, the edit, the keys, the save and the cancel
- [>] 3.1 Write the overview page, the matrix stories and the playground
- [ ] 3.2 Measure the layout on :6007
- [ ] 4.1 Take the references of the new stories after looking at them
- [ ] 4.2 Run the whole set and open the PR into the epic branch after the owner's word
