# Scenarios — the Material names of an icon

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones in the domain and do not change after the merge into the spec: the titles of the
tests refer to them.

What a scenario is covered by is said under it. Where the run does not cover a scenario, that is said
openly.

### SC-UKV-540 — the kit name wins over a glyph

Given an icon is given both a kit name and a glyph
When the name is resolved
Then the kit name is drawn, and the glyph is not looked at

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-glyph.logic.spec.ts`.

### SC-UKV-541 — by `map-first` a glyph takes its pair, and without a pair the font

Given the strategy is `map-first`
When a glyph with a pair, a glyph that is itself a kit name and a glyph without a pair are resolved
Then the first two draw kit names, and the third draws the ligature

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-glyph.logic.spec.ts`.

### SC-UKV-542 — by `font` a Material glyph draws the font even with a pair

Given the strategy is `font`
When a glyph with a pair is resolved
Then it draws the ligature, not the pair

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-glyph.logic.spec.ts`.

### SC-UKV-543 — an icon with a paired glyph draws the pair

Given the icon gets the glyph `arrow_back`, which has a pair
When it is drawn
Then it refers to the kit symbol `arrow-left`, and no ligature stands in it

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-glyph.component.spec.ts`.

### SC-UKV-544 — an icon with an unpaired glyph draws the ligature and asks for no file

Given the icon gets a glyph without a pair and the step `lg`
When it is drawn
Then the ligature stands in it with a font size of 24 pixels, and no request goes for a file

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-glyph.component.spec.ts`.

### SC-UKV-545 — the icon draws the kit name when given both

Given the icon gets a kit name and a glyph
When it is drawn
Then it refers to the symbol of the kit name, and no ligature stands in it

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-glyph.component.spec.ts`.

### SC-UKV-546 — under the strategy `font` the icon draws a paired glyph as the ligature

Given the application set the strategy `font`
When the icon gets a glyph with a pair
Then the ligature is drawn instead of the pair

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-glyph.component.spec.ts`.

### SC-UKV-547 — the fill of the icon sets the fill of the font

Given the icon draws the ligature
When it is given the fill
Then the ligature carries the filled modifier, which sets the font's fill

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-glyph.component.spec.ts`.

### SC-UKV-548 — the ligature is hidden until the page's fonts are ready

Given the page's fonts are not ready yet
When the icon draws the ligature
Then the ligature carries the waiting modifier and is not visible. Without it the glyph word shows
in the fallback font while the font loads

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-glyph.component.spec.ts`.

### SC-UKV-549 — a call with two addresses works as before

Given the application calls `provideRtIcons` with two addresses
When the providers are read
Then both addresses stand as given, and the strategy is `map-first`

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-glyph.component.spec.ts`.

### SC-UKV-550 — the third argument sets the strategy

Given the application passes `{ glyphStrategy: 'font' }` as the third argument
When the providers are read
Then the strategy is `font`

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-glyph.component.spec.ts`.

### SC-UKV-551 — an icon spins on request

Given the icon is given the spin
When it is drawn
Then it carries the spin modifier, and without the spin it carries none

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-glyph.component.spec.ts`. The run does
not check that the spin slows down when the system asks for less motion. That is a style rule under
a media query, and the spec environment has no such query.

### SC-UKV-552 — the size of an icon takes pixels

Given the icon is given 14, 56, the string `48` or the step `lg`
When it is drawn
Then it is a square of 14, 56 and 48 pixels and of the step `lg` property. A size that is neither a
positive number nor a step draws the step `md`

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-glyph.component.spec.ts`.

### SC-UKV-553 — under the material preset a button draws the material drawing

Given two buttons with the icon `close`, one of them inside markup with the material preset
When they are drawn
Then the first refers to the kit symbol, the second to the material one

Covered: `projects/ui-kit-v2/src/lib/components/button/rt-button-glyph.directive.spec.ts`.

### SC-UKV-554 — a button with a paired Material name draws the pair

Given a button gets the icon `arrow_back`
When it is drawn
Then it refers to the kit symbol `arrow-left`

Covered: `projects/ui-kit-v2/src/lib/components/button/rt-button-glyph.directive.spec.ts`.

### SC-UKV-555 — a button with an unpaired Material name draws the ligature

Given a button gets an icon name that is neither a kit name nor paired
When it is drawn
Then the ligature stands in place of the icon. Before, such a name drew an empty place

Covered: `projects/ui-kit-v2/src/lib/components/button/rt-button-glyph.directive.spec.ts`.

### SC-UKV-556 — the icon button takes a glyph

Given the icon button gets a glyph and no kit name
When it is drawn
Then its icon draws by the Material name

Covered: `projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button.component.spec.ts`.

### SC-UKV-557 — a segment of the toggle button group takes a glyph

Given a segment of the group is declared with a glyph
When the group is drawn
Then the segment's icon draws by the Material name

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group.component.spec.ts`.

### SC-UKV-558 — the empty state takes a glyph

Given the empty state gets a glyph and no kit name
When it is drawn
Then its icon place is shown and draws by the Material name

Covered: `projects/ui-kit-v2/src/lib/components/empty-state/rt-empty-state.component.spec.ts`.

### SC-UKV-559 — a menu item of the split button draws a Material name

Given a menu item of the split button is declared with an unpaired Material name
When the menu opens
Then the item draws the ligature

Covered: `projects/ui-kit-v2/src/lib/components/split-button/rt-split-button.component.spec.ts`.

### SC-UKV-709 — one icon overrides the application's strategy

Given the application draws glyphs by the strategy `map-first`
When an icon with the glyph `arrow_back` gets `glyphStrategy` `font`
Then it draws the ligature, while a neighbour without the input draws the pair `arrow-left`

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-glyph.component.spec.ts`.

### SC-UKV-710 — the font axes of the ligature come from the application

Given the application sets `--rt-icon-glyph-weight` to 600 above an icon drawing a ligature
When it is drawn
Then the ligature's font variation carries the weight 600, and without the properties the weight
400, the grade 0 and the optical size equal to the side of the icon

Not covered: a test has no styles at all — the font variation is read by a measurement on the icon
story of the showcase.

### SC-UKV-711 — every colour of the icon is an application property

Given the icon is given each of the colours but `current`
When it is drawn
Then its colour is the property `--rt-icon-color-<colour>` with the kit role as default, and
`primary` and `disabled` are among them

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon.component.spec.ts`.

### SC-UKV-712 — a size step is an application property

Given the icon is given each of the eight steps
When it is drawn
Then its side is the property `--rt-icon-step-<step>` with the step of the kit size scale as
default, `3xl` and `4xl` among them

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon.component.spec.ts`.

### SC-UKV-774 — by `font` a kit name the font cannot draw draws the kit drawing

Given the strategy is `font`
When a button or an icon gets the kit name `ico-plus`, and then the kit name `search`
Then `ico-plus` draws the kit drawing with no text, and `search` stays the ligature

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-glyph.logic.spec.ts`,
`projects/ui-kit-v2/src/lib/components/button/rt-button-glyph.directive.spec.ts`.

### SC-UKV-779 — the sign of the icons alone draws the material drawings

Given icons and a button with `close`, one inside the material preset and others inside the sign `data-rt-icon-preset='material'`
When they are drawn
Then both under the sign refer to the material symbol, like the one under the preset, while an icon outside refers to the kit symbol

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon.component.spec.ts`.
