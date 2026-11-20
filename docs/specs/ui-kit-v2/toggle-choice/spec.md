# The toggle choice: a folding toggle group and a field with toggles

**Status:** in force · **Revision:** 20 November 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the toggle button group of the second kit, the select and the multiselect of the
second kit, the panel of choice in the bottom sheet
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written by task RT-3399. It left the subdomain of the panel
of choice in the bottom sheet when that one outgrew the length limit.

## Why

A row of toggle buttons runs past a phone screen, and a filter of categories drawn as switches
had to be built around the kit by hand: an inert select for the label, a popover of its own and a
hand-set open look. Both are choices of values, and the kit already has a field for that.

## Terminology

- **Folding** — a toggle button group that does not fit its width is drawn as a field of choice
  with the same values.
- **A field with toggles** — a multiselect whose panel shows a switch per value instead of a
  checkbox, and whose field sums the choice up instead of drawing chips.

### What it is called in the interface

The person sees a field with a chevron where the buttons were, and a list of switches with
«Show all» on top.

## Rules

- **A toggle button group whose buttons do not fit the width folds into a field of choice.** Only
  a one-line group folds; the field takes the same values, a single choice as a select and a
  multiple one as a multiselect, and on a phone it opens them in the sheet. A choice there counts
  as a press on the button. One input keeps the buttons however long they are.
- **The folded field is as wide as the buttons with the unfold margin, and no wider than its
  place.** Across the whole place it gave a parent sized by its content nothing to grow by: the
  group folded once in a squeezed moment and stayed a narrow field with half the toolbar empty.
  In a flex row the group does not shrink either: a date field next to it counts narrower in the
  row's sum than it is drawn, and the group took the whole shortfall and folded to 59 points.
- **A field of several values can show its choice as toggles.** The field then sums the choice up
  — «All», «N of M» or its placeholder — instead of chips. The panel puts «Show all» and the
  application's own toggles above a line, and one toggle per value under it. A toggle only shows
  the choice: the row takes the press. In the sheet this look has no footer, since every row is
  already a switch.

## What is out of scope

- A group that wraps onto several lines does not fold: it already fits.
- The look of a single toggle does not change.

## Contract

Not applicable: no procedures.

### Refusal codes

Not applicable.

## Data

Not applicable.

## Screens and states

| Screen                | Loading   | Empty     | Refusal   |
| --------------------- | --------- | --------- | --------- |
| A folded toggle group | no change | no change | no change |
| A field with toggles  | no change | no change | no change |

## Cross-cutting requirements

### Locales

The field with toggles brings three kit labels: `uiAll` («All»), `uiCountOf` («{{count}} of
{{total}}») and `uiShowAll` («Show all»); an application in another language adds them to its own
dictionary under `rtKit`.

### SEO

Not applicable.

### Mobile layout

On a phone the folded group and the field with toggles open their values in the bottom sheet, by
the subdomain of the panel of choice in the bottom sheet.

### Several objects

Not applicable.

## Decisions

- **The folded group is drawn by the select and the multiselect of the kit, not by a field of its
  own.** The values, the keys and the sheet then come with them.

## Open questions

None.

## History of changes

| Date       | What changed                                                                    |
| ---------- | ------------------------------------------------------------------------------- |
| 2026-11-20 | Moved out of the subdomain of the panel of choice in the bottom sheet (RT-3399) |
