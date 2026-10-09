# The Material names of an icon

**Status:** in force · **Revision:** 8 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the icon of the second kit and its table of Material pairs; the material preset
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written before the code by task RT-2473 of the epic RT-2472.

## Why

An application moving from the first kit names its icons by Material names: the first kit drew them
by the Material Symbols font. The second kit draws only its own names and 49 Material pairs from its
table, and a name without a pair draws an empty place. The icon cannot spin, and its size is chosen
from six steps, so 14, 48 and 56 pixels are out of reach. A button under the material preset draws
the kit drawing where every other icon draws the Material one.

## Terminology

| Term         | What it is                                                                    |
| ------------ | ----------------------------------------------------------------------------- |
| a kit name   | a name the icon set of the kit draws                                          |
| a glyph      | a Material name given to an icon instead of a kit name                        |
| a pair       | the kit name the table of Material pairs gives to a glyph                     |
| the ligature | the glyph drawn as text in the Material Symbols font                          |
| the strategy | how a glyph is drawn: `map-first` — the pair first, `font` — the font at once |

### What it is called in the interface

A person sees an icon; how it is drawn is invisible to them.

## Rules

- **An icon is named by a kit name or by a glyph, and the kit name wins when both are given.**
- **By the strategy `map-first` a glyph draws its pair, and without a pair the ligature.** A glyph
  that is itself a kit name draws that name.
- **By the strategy `font` a glyph draws the ligature, unless it is a kit name the font cannot
  draw.** Such a name, with a hyphen or a capital letter, draws the kit drawing; a kit name that is
  also a ligature, like `search`, stays the ligature.
- **The strategy is set for the application by the third argument of `provideRtIcons`, and
  `map-first` is the default.** A call with two addresses works as before.
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
- **Under the material preset a button asks for the material drawing of its icon, as the icon
  does.**
- **The icon button, the toggle button group, the split button and the empty state take a glyph
  next to their kit name.**
- **Without a glyph, a spin and a size in pixels every icon draws as before.**

## What is out of scope

- Shipping the Material Symbols font: the application connects it itself.
- The empty button of the side menu without a pair — task RT-2482.
- The icon of a toast — task RT-2478.

## Contract

Not applicable: the surface is inputs of kit components and an argument of a provider function.

### Refusal codes

Not applicable.

## Data

Not applicable: the icon keeps nothing.

## Screens and states

| State                  | What is visible                                               |
| ---------------------- | ------------------------------------------------------------- |
| a glyph with a pair    | the kit drawing, or the material one under the preset         |
| a glyph without a pair | the ligature of the font, after the fonts are ready           |
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

Every icon resolves its own name: a glyph with a pair and one without stand side by side and draw
by their own ways.

## Decisions

- **The strategy is the third argument of `provideRtIcons`, not an object in place of the second.**
  The second is the address of the material drawings, and changing its type breaks every call.
- **`name` of the icon is no longer required.** The glyph stands next to it; a required name would
  force a placeholder name on every glyph.
- **One resolver of a Material name lives in the icon folder.** The menu item and the side menu
  resolved it by two copies of their own; they move onto it with their behaviour unchanged.
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
