# The names and the sets of icons

**Status:** in force · **Revision:** 26 November 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the icon of the second kit; the material preset
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written before the code by task RT-2473 of the epic RT-2472.

## Why

An application moving from the first kit names its icons by Material names: the first kit drew them
by the Material Symbols font. The second kit draws its own names. It used to translate part of the
Material names by a table that loaded on the start of every application, and a set of drawings was
chosen once by the markup and never changed.

Now every set of icons has the same names, a set is data the application can add, and the set changes
on a live page. The kit no longer translates first-kit names: an application renames them itself, and
the script `rename-icon-names` from the package does it in its templates.

## Terminology

| Term         | What it is                                                                   |
| ------------ | ---------------------------------------------------------------------------- |
| a kit name   | a name the icon set of the kit draws                                         |
| a glyph      | a name given to an icon by the input `glyph`, not checked by the type        |
| the ligature | the glyph drawn as text in the Material Symbols font                         |
| the strategy | how a glyph is drawn: `map-first` — a kit name first, `font` — the font      |
| a set        | a folder of drawings with the names of the kit, published at its own address |
| a fallback   | the set a missing drawing of a set is taken from                             |
| a part       | a node of the page with a set of its own                                     |

### What it is called in the interface

A person sees an icon; how it is drawn and from which set is invisible to them.

## Rules

- **An icon is named by a kit name or by a glyph, and the kit name wins when both are given.**
- **By the strategy `map-first` a glyph that is a kit name draws that name.** Any other glyph draws
  the ligature. A first-kit name is not translated: the kit names its icons by kit names only.
- **By the strategy `font` a glyph draws the ligature, unless it is a kit name the font cannot
  draw.** Such a name, with a hyphen or a capital letter, draws the kit drawing; a kit name that is
  also a ligature, like `search`, stays the ligature.
- **The strategy is set for the application by the option `glyphStrategy` of `provideRtIcons`, and
  `map-first` is the default.**
- **One icon sets its own strategy by the `glyphStrategy` input, and it overrides the
  application's.** Without the input the application's strategy holds.
- **The font axes of the ligature are properties the application sets above the icon.** Weight
  `--rt-icon-glyph-weight`, grade `--rt-icon-glyph-grade` and optical size `--rt-icon-glyph-opsz`
  default to 400, 0 and the side of the icon in pixels — what the browser took without the axis, so
  an icon without the properties draws as before; the fill still comes from the `fill` input.
- **The ligature is hidden until the page's fonts are ready, and the kit ships no font.** The family
  is the property `--rt-icon-glyph-font`, and the fill of the icon sets the font's fill.
- **An icon spins on request, and slower when the system asks for less motion.**
- **The size of an icon takes pixels as well as a step.**
- **A size step is the property `--rt-icon-step-<step>`, and its default is the kit size scale.**
  Eight steps: `xs` 12, `sm` 16, `md` 20, `lg` 24, `xl` 32, `2xl` 40, `3xl` 48 and `4xl` 64 pixels.
  A number stays pixels.
- **Every colour of the icon but `current` is a property the application sets above it.** The
  default of `--rt-icon-color-<colour>` is the kit role the colour drew before; `primary` and
  `disabled` stand next to the former ones.
- **A set of icons is declared as data, and the application adds its own in `provideRtIcons`.** A set
  is a name, an address, a fallback set, an optional list of its names and a sign of filled
  drawings. Names are the same in every set.
- **A drawing a set does not hold comes from its fallback, and the chain ends at `kit`.** A set
  without a named fallback takes `kit`. A name outside the list of a set is not requested from it.
- **One address is downloaded once, and its refusal is kept.** An answer that is not an SVG file
  counts as a refusal. A filled icon whose file comes from a fallback takes a symbol of its own.
- **A bad declaration of sets gives a warning and the set `kit`.** A drawing found nowhere gives one
  warning with the icon and the set. These warnings are developer messages: a production build of
  the application drops their texts, and the choice of the drawings stays the same.
- **The set of an icon is the set of its part, then the choice of `use()`, then the material sign,
  then the set of the application.** A part is named by the directive `rtIconSet`; `use()` is a
  method of `RtIconSetService`.
- **A change of the set redraws the drawn icons and buttons, and the old drawing stays until the new
  one arrives.** A new name of an icon does not keep the old drawing, and a button keeps its content.
- **A panel and a window opened from a part take its set.** The panels of the menu, the popover, the
  bottom sheet, the confirmation and the aside of the container take it on every opening. A dialog
  and an aside take it from the focused node, and the confirmation of a menu item takes the set of
  the item. A window already open keeps its set. A part holds what is declared inside it: a template
  declared outside a part, and content projected into it from outside, keep the set of the place of
  their declaration. An aside opened with the focus outside parts takes the set of the part of its
  `injector`, and `iconSet` of a dialog or an aside names the set instead. A browser that does not
  focus a clicked button leaves the focus outside the part.
- **Under the material preset a button asks for the material drawing of its icon, as the icon
  does.**
- **A sign of the icons alone switches the drawings under it to the material set and carries no tokens.** The
  material preset changes the tokens and the drawings at once; the sign changes the drawings only,
  for the icon and for the button alike.
- **The icon button, the toggle button group, the split button and the empty state take a glyph
  next to their kit name.**
- **Without a glyph, a spin and a size in pixels every icon draws as before.**

## What is out of scope

- Shipping the Material Symbols font: the application connects it itself.
- Drawing the missing material drawings: the set `material` takes them from `kit`.
- Checking that a set of the application is complete.
- Following a change of the material sign on a live page, and changing the set of a window already
  open.
- The icon of a toast — task RT-2478.

## Contract

The surface is inputs of kit components, the options of `provideRtIcons` — `sets`, `default`,
`glyphStrategy` —, the method `use()` of `RtIconSetService` and the directive `rtIconSet`.

An application of an earlier version has these breaking moves: `provideRtIcons` takes one object of
options instead of two addresses; the table `iconMaterialMap`, the type `IRtIconMaterialEntry` and
`materialPairOf` are gone; `RT_ICONS_BASE_URL`, `RT_ICONS_MATERIAL_BASE_URL` and `IRtIcon.Drawing`
are gone; `request` and `symbolHref` of the registry take a set name and a fill sign; an icon name
that comes as data must be a kit name. A menu item and the side menu draw no first-kit name, under
`font` too; the operator glyphs of the data table are kit names, and `dataTableIconName` translates
nothing; the button of the speed menu draws the kit drawing `bars` when it has no icon of its own.

The script `rename-icon-names` renames the static attributes of templates and lists the other places
it recognizes; the list is not complete, and the table of names ships next to it as
`icon-names.json`. The script leaves a tag with a glyph strategy of its own.

### Refusal codes

Not applicable.

## Data

Not applicable: the icon keeps nothing.

## Screens and states

| State                  | What is visible                                               |
| ---------------------- | ------------------------------------------------------------- |
| a glyph, a kit name    | the drawing of the set of the icon                            |
| a glyph, another name  | the ligature of the font, after the fonts are ready           |
| a set just changed     | the old drawing until the new one arrives                     |
| the font not connected | the glyph text in the fallback font after the fonts are ready |
| a spinning icon        | the icon turning round                                        |

## Cross-cutting requirements

### Locales

Not applicable: an icon carries no label.

### SEO

Not applicable: the kit lives inside an application behind a sign-in.

### Mobile layout

Not applicable: an icon draws the same at any width.

### Several objects

Every icon takes its own set: parts with different sets stand side by side on one page.

## Decisions

- **The names are the same in every set, and the first-kit names are not translated.** The owner's
  word of 26 November 2026: the table of pairs weighed on every start, and the old names were removed
  at once.
- **A set is data, not a class.** A name, an address, a fallback, a list of names and a fill sign are
  enough for the registry to walk the chain.
- **A directive and `use()` are stronger than the material sign.** A choice made in code is later and
  more exact than the sign in the markup.
- **`name` of the icon is no longer required.** The glyph stands next to it; a required name would
  force a placeholder name on every glyph.
- **One resolver of a glyph lives in the icon folder.** The menu item and the side menu use it.
- **The size type stays as it is, and only the input takes pixels.** The type is read in many
  places, and widening it breaks consumers that map over the steps. Revised on 7 October 2026: the
  owner asked for the steps `3xl` and `4xl`, and the type grew by them; inside the kit only the
  icon itself maps over the steps.
- **The size steps are named `--rt-icon-step-*`, not `--rt-icon-size-*` as the request had it.**
  The first kit declares `--rt-icon-size-*` on the page root with values of its own — `md` is
  24 pixels there — and an application holding both kits would get them in every icon of the
  second one.
- **`primary` takes `--rt-color-action-primary-on-surface`.** The kit has no `--rt-color-primary`;
  the brand colour over a surface is the role the text button paints its label with.

## Open questions

None.

## History of changes

- 2 October 2026 — the agreement was written from the consumer's request by task RT-2473.
- 7 October 2026 — the strategy on one icon, the font axes, the colours and the size steps as
  application properties, by task RT-2619.
- 8 October 2026 — by task RT-2644 from the application's request: under `font` a kit name the
  font cannot draw takes the kit drawing instead of its own text.
- 9 October 2026 — by task RT-2722: the sign of the icons alone, `data-rt-icon-preset`.
- 26 November 2026 — by task RT-3648: one set of names, sets as data, a change of the set on a live
  page; the table of Material pairs removed, the script `rename-icon-names` added.
