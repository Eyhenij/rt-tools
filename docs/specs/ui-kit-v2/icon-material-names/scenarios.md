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

### SC-UKV-541 — by `map-first` a kit name on `glyph` draws the drawing

Given the strategy is `map-first`.
When a glyph that is a kit name and a glyph that is not are resolved.
Then the first draws the kit name, and the second draws the ligature.

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-glyph.logic.spec.ts`.

### SC-UKV-542 — by `font` a kit name that is also a ligature draws the font

Given the strategy is `font`.
When the glyph `search` is resolved.
Then it draws the ligature.

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-glyph.logic.spec.ts`.

### SC-UKV-543 — an icon with a kit name on `glyph` draws the drawing

Given the icon gets the glyph `arrow-left`.
When it is drawn
Then it refers to the kit symbol `arrow-left`, and no ligature stands in it

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-glyph.component.spec.ts`.

### SC-UKV-544 — an icon with a glyph outside the kit names draws the ligature and asks for no file

Given the icon gets a glyph that is not a kit name and the step `lg`.
When it is drawn.
Then the ligature stands in it with a font size of 24 pixels, and no request goes for a file.

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-glyph.component.spec.ts`.

### SC-UKV-545 — the icon draws the kit name when given both

Given the icon gets a kit name and a glyph
When it is drawn
Then it refers to the symbol of the kit name, and no ligature stands in it

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-glyph.component.spec.ts`.

### SC-UKV-546 — under the strategy `font` the icon draws `search` as the ligature

Given the application set the strategy `font`.
When the icon gets the glyph `search`.
Then the ligature is drawn.

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

### SC-UKV-549 — a call without options declares the built-in sets

Given the application calls `provideRtIcons` without options.
When the providers are read.
Then the sets are `kit` and `material`, the set of the application is `kit`, and the strategy is
`map-first`.

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-glyph.component.spec.ts`.

### SC-UKV-550 — the option `glyphStrategy` sets the strategy

Given the application passes `{ glyphStrategy: 'font' }` to `provideRtIcons`.
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

### SC-UKV-554 — a button with a kit name on `glyph` draws the drawing

Given a button gets the icon `arrow-left`.
When it is drawn.
Then it refers to the kit symbol `arrow-left`, and no ligature stands in it.

Covered: `projects/ui-kit-v2/src/lib/components/button/rt-button-glyph.directive.spec.ts`.

### SC-UKV-555 — a button with a name outside the kit names draws the ligature

Given a button gets the icon `pets`.
When it is drawn.
Then the ligature stands in place of the icon.

Covered: `projects/ui-kit-v2/src/lib/components/button/rt-button-glyph.directive.spec.ts`.

### SC-UKV-556 — the icon button takes a glyph

Given the icon button gets the glyph `arrow-left` and no kit name.
When it is drawn.
Then its icon refers to the kit symbol `arrow-left`.

Covered: `projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button.component.spec.ts`.

### SC-UKV-557 — a segment of the toggle button group takes a glyph

Given a segment of the group is declared with the glyph `pets`.
When the group is drawn.
Then the segment's icon draws the ligature.

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group.component.spec.ts`.

### SC-UKV-558 — the empty state takes a glyph

Given the empty state gets the glyph `pets` and no kit name.
When it is drawn.
Then its icon place is shown and draws the ligature.

Covered: `projects/ui-kit-v2/src/lib/components/empty-state/rt-empty-state.component.spec.ts`.

### SC-UKV-559 — a menu item of the split button draws a name outside the kit names

Given a menu item of the split button is declared with the icon `pets`.
When the menu opens.
Then the item draws the ligature.

Covered: `projects/ui-kit-v2/src/lib/components/split-button/rt-split-button.component.spec.ts`.

### SC-UKV-709 — one icon overrides the application's strategy

Given the application draws glyphs by the strategy `map-first`.
When an icon with the glyph `search` gets `glyphStrategy` `font`.
Then it draws the ligature, while a neighbour without the input draws the kit drawing, and an icon
without the input takes the strategy of the application.

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

### SC-UKV-1879 — a first-kit name is not translated into a kit name

Given the strategy is `map-first`.
When the glyphs `arrow_back`, `delete`, `add` and `account_circle` are resolved.
Then each draws the ligature. None is turned into a kit name.

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-glyph.logic.spec.ts`.

### SC-UKV-1880 — the places of the kit name their icons by kit names

Given the filter operators, a table column, a menu item, a side menu item and the quick menu.
When their icons are resolved.
Then the kit itself names only kit names. A first-kit name from the application gives no icon here.

Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-glyphs.logic.spec.ts`,
`projects/ui-kit-v2/src/lib/components/menu/rt-menu-item.logic.spec.ts`,
`projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-icon.logic.spec.ts`,
`projects/ui-kit-v2/src/lib/components/speed-menu/rt-speed-menu.component.spec.ts`.

### SC-UKV-1873 — a name a set does not list comes from the fallback without a request

Given the set `material` does not list the name `wallet`.
When an icon asks for `wallet` from that set.
Then only the file of the set `kit` is requested, and the icon refers to the kit symbol.

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.spec.ts`.

### SC-UKV-1874 — a drawing found nowhere gives one warning

Given neither the set of the application nor `kit` serves the drawing `close`.
When two icons ask for it.
Then the console gets one warning that names the icon and the set.

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.spec.ts`.

### SC-UKV-1875 — an invalid declaration of sets gives a warning and the set `kit`

Given a set with a bad name or an empty address, an unknown fallback or default set, or a circle of
fallbacks.
When the sets are read.
Then there is one warning, and the drawings come from the set `kit`.

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-sets.spec.ts`.

### SC-UKV-1881 — a set of the application draws its drawings and takes the rest from `kit`

Given the application declares the set `brand` and makes it the default.
When it draws a name the set serves and a name it does not.
Then the first comes from the address of `brand`, and the second from `kit`. A record named as a
built-in set changes only the fields it names.

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.spec.ts`,
`projects/ui-kit-v2/src/lib/components/icon/rt-icon-sets.spec.ts`.

### SC-UKV-1882 — one address is downloaded once, and its refusal is kept

Given two sets lead to one file of the set `kit`.
When both are asked, and the same address is asked again after its refusal.
Then the address is requested once.

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.spec.ts`.

### SC-UKV-1876 — `use()` redraws the drawn icons and buttons

Given icons and a button are drawn by the set `kit`.
When the application calls `use('brand')`, and then `use(null)`.
Then both refer to the symbol of `brand`, and then return to the set of the markup.

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-set.directive.spec.ts`.

### SC-UKV-1877 — the set of a part is stronger than `use()`, and `use()` than the material sign

Given a part with `rtIconSet="material"`, a node with the material sign and icons outside both.
When the application calls `use('kit')`.
Then the node with the sign draws `kit`, and the part keeps `material`. A part with an empty name
takes the set of the outer part, and the part carries the attribute `data-rt-icon-set`.

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-set.directive.spec.ts`.

### SC-UKV-1878 — the old drawing stays until the new one arrives

Given the icons are drawn.
When the set changes twice before any new drawing arrives.
Then the old drawing is on the screen until the drawing of the second set arrives, and a late drawing
of the first changes nothing. An unknown name in `use()` gives a warning and the set `kit`.

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-set.directive.spec.ts`.

### SC-UKV-1883 — a new name, a server and a loading button

Given the drawings are not arrived yet, or the page is drawn on the server, or a button is loading.
When the name of an icon or the set changes.
Then a new name does not keep the old drawing, the server writes the reference at once, and the
button keeps its spinner.

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-set.directive.spec.ts`.

### SC-UKV-1884 — the confirmation of a menu item takes the set of the part

Given an open menu inside a part with `rtIconSet="brand"`, and the focus outside the part.
When the item with a confirmation is chosen.
Then the confirmation window takes the set `brand`: the item passes the set of its own place.

Covered: `projects/ui-kit-v2/src/lib/components/dialog/rt-dialog-icon-set.spec.ts`.

### SC-UKV-1885 — a window opened from inside a popover takes the set of the part

Given a popover opened from a button inside a part with `rtIconSet="brand"`, with its template
declared outside the part.
When a button inside the popover opens a dialog or an aside.
Then the window and its panel take the set `brand`.

Covered: `projects/ui-kit-v2/src/lib/components/dialog/rt-dialog-icon-set.spec.ts`.

### SC-UKV-1886 — a dialog from a dialog keeps the set, and a window from outside takes none

Given a dialog opened from a part with `rtIconSet="brand"`.
When a button inside it opens a second dialog, and when a button outside any part opens a dialog.
Then the second dialog takes `brand`, and the dialog from outside draws the set of the application.

Covered: `projects/ui-kit-v2/src/lib/components/dialog/rt-dialog-icon-set.spec.ts`.

### SC-UKV-1887 — the showcase switches the sets on a live page

Given the showcase page of the sets with icons and buttons outside a part and inside it.
When the buttons of the page switch the set of the application and of the part.
Then the icons and the buttons refer to the symbols of the chosen set, and the choice of the
application does not change the part.

Not covered: it cannot be closed by a test with an identifier — the scenario is about the live page
of the showcase, and a `play` step of the story IconSet of the icon holds it. The switching itself
is covered by `SC-UKV-1876` and `SC-UKV-1877`.

### SC-UKV-1888 — under `font` the default icon of the speed menu stays a drawing

Given the application draws glyphs by the strategy `font`.
When a speed menu has no icon of its own.
Then its button draws the kit drawing `bars`, and an icon the application names is a ligature.

Covered: `projects/ui-kit-v2/src/lib/components/speed-menu/rt-speed-menu.component.spec.ts`.

### SC-UKV-1889 — filled and outline icons of a set take different symbols

Given a set without filled drawings, whose fallback has them.
When the page asks for one name filled and outline.
Then each takes its own symbol, and the filled one asks the fallback for its filled file.

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon-sets.spec.ts`.

### SC-UKV-1890 — a page with the code 200 instead of a file leads to the fallback

Given the server answers a missing drawing with a page of the application.
When the answer is not an SVG file.
Then the registry takes the drawing of the fallback set.

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.spec.ts`.

### SC-UKV-1891 — an aside opened with an injector from a part

Given a node inside a part opens an aside with its own injector, and the focus is outside parts.
When the aside opens.
Then it takes the set of that part; with `iconSet` it takes the named set, and with `null` no part.

Covered: `projects/ui-kit-v2/src/lib/components/dialog/rt-dialog-icon-set.spec.ts`.

