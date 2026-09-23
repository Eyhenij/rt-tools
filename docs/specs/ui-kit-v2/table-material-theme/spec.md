# The list and the table under a Material theme

**Status:** in force · **Revision:** 2026-09-23 · **Scenario prefix:** `SC-UKV`
**Depends on:** the table family of the kit, the material preset of the styling layer, the fields of
the kit and their two looks.
**Laws:** `frontend-application`, `verifiability`, `lists`
**Procedures:** none

## Why

An application moving from the first kit to the second opens its list next to the old one and
compares them. The first kit's list follows the application's Material theme: its header and its
search take the fill colour of the Material field. The second kit's list in the material preset
drew fixed colours of its own, a 32 px search and a checkbox 2 px above the middle of the header,
and the owner read it as "nothing like the first kit".

## Terminology

- **Material theme** — the custom properties a Material theme declares on a page: the system names
  `--mat-sys-*` and the properties of Material's own parts, such as the fill field.
- **Fill search** — the search field of the list in the `fill` look: the Material fill field of the
  first kit.

### What it is called in the interface

Nothing new is shown to a person: the list keeps its labels, only its look follows the theme.

## Rules

- **The table header in the material preset is filled with the colour of the Material fill field.**
  The name is `--rt-color-table-head-bg`; the preset reads `--mat-form-field-filled-container-color`,
  then `--mat-sys-surface-variant`, then its own scale step. The dark theme answers the name itself,
  so a dark header keeps a dark fill under the preset.

- **The table header is 44 px high, as the first kit's.** The height belongs to the header row, not
  to the cell paddings: the first kit's 10 px paddings do not lie on the scale.

- **The checkbox and the radio of the selection column stand in the middle of their cell.** Their
  hosts are block boxes in that cell: an inline host stood on the text baseline, 2 px above the
  middle, and stretched the header.

- **The fill search of the list is 52 px high.** That is the first kit's Material fill field at
  density −1. The toolbar gives the fill search size `lg` and sets that size to 52 px; the outline
  search stays small.

- **The underline of a fill field has a colour name of its own.** The name is
  `--rt-color-field-fill-underline`; the material preset reads `--mat-sys-on-surface-variant` for
  it, as the Material fill field does, and the dark theme answers it itself.

## What is out of scope

- **The round buttons above the table.** The first kit draws them as small raised Material buttons;
  that is a look of the icon button, filed as RT-2331.
- **The paginator.** Its arrows, its current page and its page size field differ from the first kit;
  filed as RT-2332.
- **The font.** The first kit ships no font: its showcase sets Roboto on the page, and an application
  does the same with the second kit's font handle.
- **The floating bar of selected records.** The application places it in both kits; the second
  kit's bar already has the first kit's look.

## Contract

No new inputs or outputs. The toolbar picks the search size from the look it already receives.

### Refusal codes

Not applicable: the family is a component of the kit and throws no refusals.

## Data

Not applicable: the look holds no data.

## Screens and states

| State                              | What is seen                                                        |
| ---------------------------------- | ------------------------------------------------------------------- |
| material preset, Material theme    | header and fill search in the theme's fill colour, violet underline |
| material preset, no Material theme | header and fill search in the preset's own grey                     |
| material preset, dark theme        | the dark header of the dark theme                                   |
| own preset                         | unchanged                                                           |

## Cross-cutting requirements

### Locales

Not applicable: no labels change.

### SEO

Not applicable: the kit draws no public pages.

### Mobile layout

Not applicable: the fill search keeps the toolbar's narrow-screen rule, and the header height does
not depend on the width.

### Several objects

Not applicable: the family holds no data of a workspace.

## Decisions

- **The header colour is a name of its own rather than the surface role.** The surface role paints a
  dozen other parts of the kit, and a violet fill on all of them is not the first kit's look.
- **The fill search height is set by the toolbar, not by the fill look of the field.** A 52 px fill
  field everywhere would erase the size axis of the field, and only the list's search is that tall
  in the first kit.

## Open questions

- Whether the icon button gets a raised round look for the toolbar. Asked in RT-2331.

## History of changes

- 2026-09-23 — the subdomain is started by RT-2330 after the owner compared the two lists: «то что я
  вижу нихуя не похоже на 1 кит, палитра тем применяется? Инпуты серча не такие».
