# The look of a field under the material preset

**Status:** in force · **Revision:** 2026-10-23 · **Scenario prefix:** `SC-UKV`
**Depends on:** the field of input, the select family, the textarea, `rt-field`, the material preset and the density steps
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit about how a field looks under the material preset: the label inside,
the filled field, the colours, the insets, the clearing cross, the line under the field and the
disabled state. What a field gives the application — the label on the border, actionable icons, the
cross in the Tab order — is the subdomain `field-label-icon-actions`.

## Why

An application that moves from Material onto the second kit measured its fields against the
Material fields it had. Under the preset the kit's field differed by the height, the insets, the
cross, the colours and the disabled look, and a screen with both kinds of fields read as two
products. The kit's own look must not change by any of this.

## Terminology

- **The material preset** — the sign `rt-preset-material` or `data-preset="material"` on an ancestor
  or on the field itself; under it the kit's fields take the look of the Material fields.
- **The kit look** — the field without the preset sign.
- **A filled field** — a field with `appearance="fill"`: a fill and a bottom line in place of a
  frame.
- **A density step** — the attribute `data-rt-density` that lowers the field height by a step.

### What it is called in the interface

| In the domain      | On the screen                                       |
| ------------------ | --------------------------------------------------- |
| A filled field     | a grey field with a line under it                   |
| The line under it  | the hint or the error under the field               |
| The clearing cross | the small grey cross on a round ground at the right |

## Rules

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

- The kit look: every rule above leaves it as it was.
- The rounding of the outlined field under the preset — see «Decisions».
- What a field gives the application — the subdomain `field-label-icon-actions`.

## Contract

Not applicable: the subdomain describes styles of components, it serves no procedures. The handles
the application sets are custom properties: `--rt-input-min-width`, `--rt-input-height-app`,
`--rt-input-letter-spacing`, `--rt-field-label-letter-spacing`, `--rt-pagination-field-font-size`.

### Refusal codes

Not applicable.

## Data

Not applicable: nothing is stored, the look is the text of the style files.

## Screens and states

| Field state under the preset | What is visible                                                    |
| ---------------------------- | ------------------------------------------------------------------ |
| outlined, empty, at rest     | the label at the placeholder's place, the frame whole              |
| outlined, filled or in focus | the label on the top border, the frame broken under it             |
| filled, empty                | the label at the middle of the field, the bottom line              |
| filled, with a value         | the label inside above the value, focus thickens the bottom line   |
| disabled                     | full opacity, Material's disabled colours, the fill on-surface 4 % |
| with a message line          | a 16 px line 4 px under the field                                  |

## Cross-cutting requirements

### Locales

Not applicable: the subdomain carries no text.

### SEO

Not applicable.

### Mobile layout

Nothing of its own: the field keeps the same metrics on a narrow screen.

### Several objects

Not applicable.

## Decisions

- **The outlined field keeps the preset's rounding.** The rounding of 1.5 rem is the first kit's
  look, and other screens under the preset stand on it. An application that wants the Material 4 px
  sets it by the field's `radius` input. Rejected: changing the preset default.
- **The least width is not a preset default.** A field with a least width of 212 px breaks narrow
  cells and the pagination size field. Rejected: a default under the preset.

## Open questions

None.

## History of changes

- 2026-10-14 — the application's measurement against Material: the field under the preset.
- 2026-10-23 — merged from the agreement into the subdomain, task RT-2812.
