# The field's label on the border, actionable icons and the clearing cross

**Status:** in force · **Revision:** 2026-10-30 · **Scenario prefix:** `SC-UKV`
**Depends on:** the field of input, the select family, the shared base of the fields, the tooltip of the kit
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit about what a field gives an application that moves from Material:
the option template of the select, the label on the border, actionable icons, the clearing cross
and the length limit. The look of these fields under the material preset is the subdomain
`field-material-look`.

## Why

An application that moves from Material onto the second kit loses five things on its fields.

- The rows of the select list cannot show a coloured mark before the label: the consumer's template
  reaches only the closed field.
- A field in a compact toolbar has no visible label: the label of `rt-field` stands above the field
  and makes the toolbar taller, so the application falls back to an aria label alone.
- An icon of the input that starts an action is not a button: it gets no keyboard focus and no
  tooltip, and the application detects the click by the icon's class.
- The clearing cross cannot be reached with the Tab key.
- Clearing tells the host nothing: no DOM event fires, and a host that listens to `change` misses it.

Every extension is optional. A field that names none of them looks and behaves as before. The same
work fixed the fields' behaviour inside a host form, the checkbox without a form, Escape in an open
list and the paging of the autocomplete; their scenarios live here.

## Terminology

- **The option template** — the consumer's markup for the label of one row of the select list.
- **The label on the border** — a visible label of the field. It lies at the placeholder's place
  while the field is empty and at rest. It rises onto the top border when the field holds a value or
  is in use, and it adds no height.
- **An actionable icon** — the left or right icon of the input made a button: it is focused,
  pressed with the mouse, Enter or Space, and may carry a tooltip.
- **The clearing cross** — the button that resets the field's value.

### What it is called in the interface

The person sees a label inside the field's frame, a coloured mark in a list row, an icon that
can be pressed and shows a hint, and a cross that the Tab key reaches.

## Rules

- **The select draws the consumer's option template in place of the row label.** The template gets
  the option and whether it is chosen; the tree toggle, the check mark, the choosing and the keys
  stay with the kit.
- **The chosen value in the field is drawn by the same option template.** A colour mark seen in
  the list stays at the chosen value; an empty field shows the placeholder.
- **Without an option template the row is drawn as before.**
- **The label on the border lies at the placeholder's place while the field is empty and at
  rest.** At rest means: the input is not focused, the select's list is closed. The placeholder is
  not drawn while the label lies in its place.
- **The label rises onto the top border when the field holds a value or is in use.** The height of
  the field does not change, and the label cuts the border under itself.
- **The label on the border names the control for assistive technology when no aria label is
  given.**
- **The label on the border is drawn only under the material preset.** The kit look draws such a
  field as before: with its placeholder and without the label; the label still names the control.
  Under the preset the border is broken under the risen label, and a filled field keeps the risen
  label inside itself, above the value.
- **A field without the label on the border is drawn as before.**
- **An icon of the input marked as actionable is a button.** It is reached by the Tab key, pressed by
  the mouse, Enter and Space, and each press is reported to the host by the output of its side.
- **Pressing an actionable icon does not move focus into the native field.**
- **An actionable icon may carry a tooltip.** The tooltip text also names the button for assistive
  technology.
- **The right icon of a password field with a show switch is not made actionable.** The place is
  taken by the switch.
- **An icon not marked as actionable is drawn as before.**
- **An actionable icon is disabled by its own input while the field stays usable.** Its tooltip
  stays and says why.
- **The clearing cross of the input and the select is reached by the Tab key when the field asks for
  it.** By default it stays out of the Tab order, as before.
- **The kit settings name whether the clearing cross goes by Tab.** The fields node `formControl`
  of the kit settings takes `clearTabbable`. `clearTabbable` on the element wins over it, and
  without either the cross stays out of the Tab order, as before.
- **Every control of the shared base with a clearing cross obeys `clearTabbable`.** Besides the
  field of text and the select, so do the autocomplete, the number field, the date picker and the
  date range. None of them keeps its cross out of the Tab order by a fixed index.
- **The cross of the multiselect goes by Tab as a button next to the trigger.** With
  `clearTabbable` the multiselect draws its cross as a neighbouring button over its place in the
  row, as the select does: a button inside the trigger is not announced by a screen reader, and
  its Enter would open the list. Tab from the trigger reaches the cross, Enter on it clears the
  choice and leaves the list closed.
- **Clearing reports to the host after the value is reset and the change is sent to the form.** The
  event comes from the shared base, so every field with a cross reports it.
- **The cross is shown by default.** The default does not change: a form that never asked for the
  cross still gets it, and that is written in the docs of the input and the select.
- **An input and a textarea take a length limit that goes onto the native field.** The browser
  then refuses a character past the limit, typed or pasted. Without the limit the field carries no
  such attribute. The form's own length check stays with the application: a value set by code is
  not cut.

## What is out of scope

- Changing the default of the cross.
- The list clear of the dynamic selector: it is a button of its own and already goes by Tab.
- The option template of the multiselect.
- The label on the border for the fields other than the input and the select.
- The look of these fields under the material preset — the subdomain `field-material-look`.

## Contract

Not applicable: the surface is the inputs and outputs of components of the kit, the subdomain
serves no procedures. What the application gives and gets:

- `rt-select` — content `<ng-template rtSelectOption let-option let-selected="selected">`, the
  context `IRtSelect.OptionContext`, none by default.
- `rt-input`, `rt-select` — `floatingLabel`, `string | null`, `null` by default.
- `rt-input` — `iconLeftAction`, `iconRightAction`, `boolean`, `false` by default;
  `iconLeftDisabled`, `iconRightDisabled`, `boolean`, `false` by default.
- `rt-input` — `iconLeftTooltip`, `iconRightTooltip`, `string | null`, `null` by default.
- `rt-input` — the outputs `iconLeftClick`, `iconRightClick`.
- `rt-input`, `rt-textarea` — `maxlength`, a number or `null`, `null` by default.
- Every field of the shared base — `clearTabbable`, `boolean`, `false` by default; the output
  `cleared`.

### Refusal codes

Not applicable.

## Data

The subdomain has no records of the storage of its own.

## Screens and states

| Field state    | The label on the border                            |
| -------------- | -------------------------------------------------- |
| empty, at rest | at the placeholder's place, the placeholder hidden |
| empty, in use  | on the top border                                  |
| filled         | on the top border                                  |
| disabled       | where the value puts it, in the disabled tone      |
| invalid        | on the border in the error tone when risen         |

## Cross-cutting requirements

### Locales

Not applicable: the labels and tooltips come from the consumer.

### SEO

Not applicable.

### Mobile layout

Nothing of its own: the label scales with the field's font.

### Several objects

Not applicable.

## Decisions

- **The option template is a marker directive, as the trigger's.** Rejected: an input taking a
  template — the kit already has one shape for the consumer's markup in the select.
- **The tabbable cross and the clearing event live in the shared base.** The clearing itself is
  there. Rejected: an input on two components — a third field would repeat it.
- **The label on the border is an input of the two fields, not of the shared base.** Its markup and
  look belong to each field.
- **A node of its own for the cross rather than a field of the common settings.** The common
  settings hold what acts on the whole page, such as the theme; the cross belongs to one family of
  controls.

## Open questions

None.

## History of changes

- 2026-10-13 — written before the code, from the application's request accepted by the owner.
- 2026-10-23 — the application's request: the length limit of the input and the textarea.
- 2026-10-23 — merged from the agreement into the subdomain, task RT-2812.
- 2026-10-30 — the application's request: the clearing cross by Tab from the kit settings on every
  field with a cross; merged from the agreement into the subdomain, task RT-2995.
