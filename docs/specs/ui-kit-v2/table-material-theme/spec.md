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
- **Outline search** — the same field in the `outline` look: the Material outline field of the first
  kit, a border on every side and no fill inside.

### What it is called in the interface

Nothing new is shown to a person: the list keeps its labels, only its look follows the theme.

## Rules

- **The list and the table of the first kit draw the first kit's look by default.** The family
  carries the material preset on its own host, so it looks like the first kit wherever it stands,
  and its neighbours on the page keep their look. The panels it opens above the page — the column
  settings panel and the row menu — get the same class from it.

- **Another look of the family is set by the kit settings.** `dataTable.look` in the kit settings
  gives `own`, the second kit's look; the `look` input on the spot beats the settings.

- **The default look of the list search and the filter fields is set by the kit settings.**
  `dataList.appearance` and `dataList.filterAppearance`; the kit's own defaults are `fill` and
  `outline`, the first kit's.

- **The table header in the material preset is filled with the colour of the Material fill field.**
  The name is `--rt-color-table-head-bg`; the preset reads `--mat-form-field-filled-container-color`,
  then `--mat-sys-surface-variant`, then its own scale step. The dark theme answers the name itself,
  so a dark header keeps a dark fill under the preset.

- **The table header is 44 px high, as the first kit's.** The height belongs to the header row, not
  to the cell paddings: the first kit's 10 px paddings do not lie on the scale.

- **The checkbox and the radio of the selection column stand in the middle of their cell.** Their
  hosts are block boxes in that cell: an inline host stood on the text baseline, 2 px above the
  middle, and stretched the header.

- **The list search in the material preset is 52 px high in both looks.** That is the first kit's
  Material field at density −1. The height, the 4 px radius, the outline border and the transparent
  inside of the outline search are names of the list search, `--rt-list-search-*`: the own preset
  keeps its small pill search, the material preset rewrites them.

- **The list search in the material preset has the first kit's measures.** 22rem wide, a 24 px icon
  12 px in from the edge, 16 px from the icon to a 16 px text, the icon and the text in the variant
  tone of the theme. The field takes them through its own properties — the icon size, the icon tone
  and the gap — whose defaults are its former values.

- **The list search is drawn fill when the look is not given.** The first kit's field takes the fill
  look of Material when nothing is said; the filter fields stay outline by default in both kits.

- **The underline of a fill field has a colour name of its own.** The name is
  `--rt-color-field-fill-underline`; the material preset reads `--mat-sys-on-surface-variant` for
  it, as the Material fill field does, and the dark theme answers it itself.

- **The column settings panel of the list draws the first kit's panel in the material preset.** The
  numbers are taken from the first kit's panel on its showcase: 32 px insets, a 24 px title with its
  caption under it in the header, 48 × 24 switches 32 px apart, 48 px column plaques in the colour of
  the selected Material option, 36 px pill buttons with no line above them and a backdrop with no
  blur. The list hands the preset class to the panel and to its backdrop, because both are drawn over
  the page, outside the list. A dragged plaque keeps that look too: it carries the preset class and
  its own properties itself, and the place it left stays empty, as in the first kit.

- **A node carrying the preset declares the light base under the set.** The set rewrites only its own
  names, and a name that refers to one of them stays resolved at the page root: the text button of
  the panel kept the base blue while the brand beside it followed the theme.

- **An icon of a column is filled unless its declaration says outlined.** That is how the first kit
  draws it: `'FILL' 1` without the flag, `'FILL' 0` with it, both at weight 700. The material set
  keeps both drawings at that weight; the own set draws the icon one way.

- **The action buttons above the table are the first kit's small raised buttons in the material
  preset.** A 40 px circle with no fill, raised by the Material level 6 shadow and by level 8 under the
  pointer, a 24 px icon in the grey of the first kit that darkens under the pointer, 16 px between the
  buttons and a 32 px line between the groups. The application's own buttons in that row get the same
  look. The icon button takes it through its own properties, whose defaults leave its look as it was.

- **The page strip under the list is the kit's page strip, and the material preset gives it the first
  kit's look.** Pages are 34 px boxes in a grey frame rounded by 12 px. The current page is filled
  grey with a white number. The arrows are framed the same way and point with arrows, not chevrons.
  The range label is hidden, and the page size field stands next to the numbers without a fill. The
  own preset keeps the strip as it was.

## What is out of scope

- **The font.** The first kit ships no font: its showcase sets Roboto on the page, and an application
  does the same with the second kit's font handle.
- **The floating bar of selected records.** The application places it in both kits; the second
  kit's bar already has the first kit's look.

## Contract

The list and the table get the input `look` (`'material' | 'own'`), the menu gets `panelClass`, the
aside header gets `subtitle`.
The kit settings get the sections `dataTable` (`look`) and `dataList` (`appearance`,
`filterAppearance`). The default of `appearance` of the list stays `fill`.

### Refusal codes

Not applicable: the family is a component of the kit and throws no refusals.

## Data

Not applicable: the look holds no data.

## Screens and states

| State                              | What is seen                                                        |
| ---------------------------------- | ------------------------------------------------------------------- |
| material preset, Material theme    | header and fill search in the theme's fill colour, violet underline |
| material preset, no Material theme | header and fill search in the preset's own grey                     |
| material preset, outline search    | 52 px, radius 4 px, the theme's outline border, no fill inside      |
| material preset, dark theme        | the dark header of the dark theme                                   |
| own preset                         | a 32 px pill search, filled by default                              |

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
- **The search height is set by names of the list search, not by the look of the field.** A 52 px
  field everywhere would erase the size axis of the field, and only the list's search is that tall
  in the first kit.
- **The default look changes for the own preset too.** The input is one for both presets, and an
  application moving from the first kit keeps the look it had without saying it.

## Open questions

- None.

## History of changes

- 2026-09-23 — the subdomain is started by RT-2330 after the owner compared the two lists: «то что я
  вижу нихуя не похоже на 1 кит, палитра тем применяется? Инпуты серча не такие».
- 2026-09-23 — the family draws the first kit's look by default, and the kit settings give another,
  after «через конфиг задавать вьюху по дефолту вьюха точь в точь как в первом ките».
- 2026-09-23 — the list search is 52 px in both looks of the material preset and fill by default,
  after «инпуты серча на материальном наборе не такие как в первом ките, вьюха по дефолту должна быть
  как в первом ките».
- 2026-09-23 — the column settings panel draws the first kit's panel, after «что с асайдом на таблице
  первого кита конфиг колонок он выглядит как асайл второго кита».
- 2026-09-24 — the action buttons above the table are the first kit's small raised buttons, taken
  from RT-2331 into this work after «экшены в первом ките фаб кнопки отличаются от второго кита????».
- 2026-09-24 — the page strip under the list is the kit's strip with the first kit's look. RT-2332
  took it from «out of scope» after «нужно все чтобы таблица юзала уже компоненты второго кита».
