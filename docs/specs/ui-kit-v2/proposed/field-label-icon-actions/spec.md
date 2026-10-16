# The field's label on the border, actionable icons and the clearing cross

**Status:** proposed · **Revision:** 2026-10-13 · **Scenario prefix:** `SC-UKV`
**Depends on:** the field of input, the select family, the shared base of the fields, the tooltip of the kit
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

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

Every extension is optional. A field that names none of them looks and behaves as it does today.

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
- **The clearing cross of the input and the select is reached by the Tab key when the field asks for
  it.** By default it stays out of the Tab order, as today.
- **Clearing reports to the host after the value is reset and the change is sent to the form.** The
  event comes from the shared base, so every field with a cross reports it.
- **The cross is shown by default.** The default does not change: a form that never asked for the
  cross still gets it, and that is written in the docs of the input and the select.
- **A button draws the focus ring only for focus not from the pointer.** The browser marks focus
  from code after a mouse press as `:focus-visible`; the kit button and icon button read the source
  from the CDK, as Material does, and keep the focus while hiding the ring.
- **The preset sign on the field itself puts the label inside, the same as the sign on an
  ancestor.**
- **A density step set on an ancestor reaches a field that carries its own preset sign.** The
  step is inherited, and the preset counts the height from it on its own node. The application's own
  field height, set on an ancestor, beats the density.
- **Under the preset a filled field follows the Material filled field.** The value starts below the
  risen label, the risen label stands inside the field, the label starts 16 px from the edge, there
  is only the bottom line, and focus thickens that line. The message under the field starts at the
  field's text, right under the field.
- **Under the preset the placeholder, the resting label, the icons and the arrow take the Material
  theme's muted colour, and the caret takes the brand colour.** Without a Material theme on the page
  the colours stay as they were. An icon on either side is 24 px, 12 px from the edge and 4 px from the text:
  after a left icon the text and the resting label start at 40 px.
- **Under the preset the required mark stands right after the label.** The kit look keeps a gap.
- **An actionable icon is disabled by its own input while the field stays usable.** Its tooltip
  stays and says why.
- **A field's least width is a property set on an ancestor.** By default a field has none.
- **An icon button inside a field is never taller than the field inside its border.**
- **Under the preset the text of a field starts 16 px from its outer edge.** The border is part of
  that inset; the kit look counts it from the border.
- **Under the preset a disabled field is not faded as a whole.** The border, the text, the
  placeholder and the label take Material's disabled colours; the kit look still fades the field.
- **Under the preset the clearing cross is the first kit's cross.** The button is 19 px, the icon
  12 px and grey, and the cross of an input stands 8 px from the field edge. The kit look keeps its
  32 px button.
- **Under the preset the cross lies on the first kit's round grey ground.** The kit look keeps the
  cross without a ground.
- **Under the preset the line under a field is Material's subscript.** It is 16 px high with 4 px
  above it whenever it holds a message or a reserve; the kit look keeps its line.
- **A textarea has the filled look of an input.** Under the preset its label lies inside the field
  above the first line, 6 px stand under the last line with the underline, and no gap stands under
  the field.
- **Under the preset a value drawn by an option template does not raise the select.** The select
  stays 52 px high.
- **Under the preset a clearable input keeps Material's right inset.** The empty field's text runs
  to 4 px from the edge; with a value the cross stands 4 px after the text and 8 px from the edge.
- **Under the preset a disabled filled field is filled with on-surface 4 %.** The kit look keeps
  its fill.
- **Under the preset an icon button stands where a plain icon stands.** Its icon is 12 px from the
  field edge, and the text starts at 40 px.

## What is out of scope

- Changing the default of the cross.
- A tabbable cross on the fields other than the input and the select.
- The option template of the multiselect.
- The label on the border for the fields other than the input and the select.

## Contract

Not applicable: the surface is the inputs and outputs of components of the kit, the subdomain
serves no procedures.

| Field                          | Input / output                                                            | Type                                 | Default |
| ------------------------------ | ------------------------------------------------------------------------- | ------------------------------------ | ------- |
| `rt-select`                    | content `<ng-template rtSelectOption let-option let-selected="selected">` | `IRtSelect.OptionContext`            | none    |
| `rt-input`, `rt-select`        | `floatingLabel`                                                           | `string \| null`                     | `null`  |
| `rt-input`                     | `iconLeftAction`, `iconRightAction`                                       | `boolean`                            | `false` |
| `rt-input`                     | `iconLeftTooltip`, `iconRightTooltip`                                     | `string \| null`                     | `null`  |
| `rt-input`                     | `iconLeftClick`, `iconRightClick`                                         | output `MouseEvent \| KeyboardEvent` | —       |
| every field of the shared base | `clearTabbable`                                                           | `boolean`                            | `false` |
| every field of the shared base | `cleared`                                                                 | output `void`                        | —       |

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
- **The outlined field keeps the preset's rounding.** The rounding of 1.5 rem is the first kit's
  look, and other screens under the preset stand on it. An application that wants the Material 4 px
  sets it by the field's `radius` input. Rejected: changing the preset default.
- **The least width is not a preset default.** A field with a least width of 212 px breaks narrow
  cells and the pagination size field. Rejected: a default under the preset.

## Open questions

None.

## History of changes

- 2026-10-13 — written before the code, from the application's request accepted by the owner.
- 2026-10-14 — the application's measurement against Material: the field under the preset.
