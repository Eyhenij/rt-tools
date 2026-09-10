# Scenarios — the second level of the side menu

The identifier goes at the start of the test title, followed by a dash. The prefix is shared across the
domain, and the numbers were not recounted at the move into the subdomain: the number ties a scenario to
the title of its test.

## The mode of the submenu

### SC-UK-17 — a consumer who did not name the mode gets a submenu at a hovering

Given a side menu without an input of the mode
When the pointer leaves the curtain of the submenu
Then the submenu closes

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-18 — a pinned submenu does not close at the leaving of the pointer

Given the mode is the pinned one and an active item with a submenu
When the pointer leaves the curtain of the submenu
Then the submenu stays open

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-19 — a pinned submenu does not close at a transition by its own item

Given the mode is the pinned one and an open submenu
When an item of the submenu with a link is pressed
Then the consumer gets the press, and the submenu stays open

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-20 — a press of the switch does not change the mode but asks for it

Given the mode is the pinned one
When the switch is pressed
Then a request for the mode of the hovering goes away outward, and the input stays the former one

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-21 — a pinned submenu shows the active item

Given the mode is the pinned one, and the input of the activity names an item with a submenu
When the menu is drawn
Then the submenu of that item is open

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-22 — there is no active item and nothing is open — there is no pinned submenu

Given the mode is the pinned one, the input of the activity is empty, and nothing was opened by a hovering
When the menu is drawn
Then no submenu is open

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-23 — there is no backing under a pinned submenu

Given the mode is the pinned one and an open submenu
When the menu is drawn
Then there is no backing under the curtain

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-24 — on a narrow screen there is no switch

Given a narrow screen and the mode is the pinned one
When the submenu is open
Then there is no switch in the markup

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

## The search over a submenu

### SC-UK-25 — an empty query shows the submenu whole

Given a submenu of three items and an empty query
When the filter goes
Then all three items are given back

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/side-menu.logic.spec.ts`.

### SC-UK-26 — the filter goes by a substring of the label without a count of the case

Given a submenu with the item "Курсы валют" and the query "курс"
When the filter goes
Then that item stays

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/side-menu.logic.spec.ts`.

### SC-UK-27 — an item without a label does not get into the filter

Given a submenu with an item without a label and a non-empty query
When the filter goes
Then that item is not given back

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/side-menu.logic.spec.ts`.

### SC-UK-61 — the filter goes down into the folders of the submenu

Given a submenu with the folder "Сохранённое" and the item "Круговая диаграмма" inside it, and the query
"круговая"
When the filter goes
Then the folder stays, and inside it only that item is left

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/side-menu.logic.spec.ts`,
`projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-62 — a folder whose own label coincided is given back whole

Given a submenu with the folder "Сохранённое" of three items and the query "сохранён"
When the filter goes
Then the folder stays with all three items: the person looked for the folder and waits to see what lies in
it, not its own name over emptiness

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/side-menu.logic.spec.ts`,
`projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-63 — a folder that survived the filter stands open

Given a submenu with a folder and a query an item inside it answers to
When the query is typed
Then the folder stands open and the found item is on the screen without one more press; an emptied query
gives the former openness back — the one that was there before the typing

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/side-menu.logic.spec.ts`,
`projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-28 — there are no coincidences — the submenu says so by a line

Given an open submenu and a query no item answers to
When the query is typed
Then a line of a message stands instead of the list

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-29 — a closed submenu opens with an empty query

Given a submenu with a typed query
When it is closed and opened anew
Then the query is empty, and the list is shown whole

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-30 — the pinning does not change what is visible

Given a submenu opened by a hovering, and there is no input of the activity
When the switch is pressed and the consumer gave the mode back as the pinned one
Then the submenu holds the same items as before the press

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-31 — a pinned and an unpinned submenu are marked by a different look of the button

Given the submenu is shown in both modes
When a person looks at the switch
Then at the pinned one the icon of the button is coloured, at the unpinned one it is quiet, and the
difference is led by the look of a ready button of the kit, not by the filling of the glyph: the filling is
set by an axis of a variable font, and not every set registered by the consumer reads it — on a static one
both states are drawn by one glyph

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-32 — the choice of the mode outlives a reload

Given a person pinned the submenu
When the page is reloaded
Then the submenu is still pinned: the mode is a setting of a person, not a state of the screen, and it is
kept by the consumer by the key and the taking apart the kit gives; a storage closed by the settings of the
browser does not stop the work and leaves the former mode

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/side-menu.logic.spec.ts`.

### SC-UK-33 — the width of the submenu does not go past the limits

Given a person pulls the edge of a pinned submenu
When the hand leads the edge narrower than the lower limit or wider than the upper one
Then the width is taken as the limit one: narrower than the lower one not a single label of an item fits,
wider than the upper one the submenu covers the content of the page the menu was opened for

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/side-menu.logic.spec.ts`.

### SC-UK-34 — the chosen width outlives a reload

Given a person stretched the pinned submenu
When the page is reloaded
Then the submenu is of the same width: the width is a setting of a person and is kept by the same technique
as the mode; there is no saved choice, the value is not a number or the storage is closed by the settings of
the browser — the width is put by the design, and a number of one's own instead of it would substitute the
value from the set of the tokens

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/side-menu.logic.spec.ts`.

### SC-UK-35 — the edge of a pinned submenu is pulled by the pointer

Given a pinned submenu
When a person takes its right edge and leads it by the pointer
Then the panel goes after the hand within the limits of the width, and at the release the width goes away
as a request outward — it is kept by the consumer, as the mode is; an unpinned submenu has no handle at all:
it lives by the hovering and leaves the screen before the hand reaches the edge

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-36 — in a filtered label what it coincided by is marked

Given a person typed a query in the search of the submenu
When the coincided items stayed in the list
Then in the label of each exactly what was typed is marked and all its occurrences, not the label whole: a
label highlighted whole says the same as its presence in the list. The case of the label stays as the
consumer wrote it, and an empty query marks nothing

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/side-menu.logic.spec.ts`,
`projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-37 — the field of the search of the submenu is drawn by a ready one of the kit

Given a submenu with a field of the search
When a person looks at the field and types a query
Then the field stands in the shell of a field of the kit — the same one the search of the toolbar of the
table is drawn by — with the icon of the search and the button of the clearing: a markup of one's own
diverges from the ready one at the very first edit of the kit, and there is nobody to notice that. The
button of the clearing is not visible at an empty query and brings the full list back

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-38 — the submenu is never narrower than the width set by the design

Given the consumer set the width of the submenu by their own design
When a person pulls the edge of the panel to the left further than that width
Then the panel stops at the set width and does not become narrower: the lower limit is held by the design
itself, not by a number in the kit — the width is known by the consumer, and a number of one's own would
diverge from it at every second one. The pull to the right widens the panel as before

Not covered: the limit is held by the rule `max(...)` in the design, and the styles of a component are not
applied in a spec — the width of the panel there is zero. Taken by a measurement in the browser: the width
set by the design is 240 pixels, the pull to the left leaves 240, the pull to the right gives 358.

### SC-UK-39 — the work with the field holds an unpinned submenu open

Given an unpinned submenu opened by a hovering
When a person presses in the field of the search or types a query in it
Then the submenu stays open after the leaving of the pointer too, and widens to the full width: a narrow
strip is good while the list is looked over in passing and is not good when something is searched for in it.
The submenu is closed by a press from outside, and the same press lifts the holding; a pinned submenu has no
holding at all — it is open anyway

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.
The width grows instantly: the width of the curtain Material holds by its own code, and a transition by the
width, a transition by the lower boundary and the frames leave the panel the former one — all three are
measured.

### SC-UK-40 — an item of the submenu takes the width of the panel and does not go past it

Given a submenu whose width changes — by a pull of the edge and by the work with the field of the search
When the panel becomes wider or narrower
Then the item goes after it and takes its width, and does not go past the edge of the panel by any of its
looks: a label that did not fit into the given width goes into an ellipsis. A nested item stands with the
padding of its level and counts the limit from the place, not from a number: a limit by a number would carry
its edge past the panel by exactly that padding

Not covered: the width cannot be taken by a spec — it is held by the design, and the styles of a component
are not applied in a spec, and the width of the panel there is zero. Closed by the show `SubMenuLongTitle`
(`projects/ui-kit/src/lib/ui-kit/side-menu/stories/side-menu.stories.ts`): it goes by a real browser,
measures the right edge of every item against the edge of the panel and demands a cut label — the checking of
the coverage reads only the files of the specs and does not count a show as a test.

### SC-UK-41 — a submenu held by the field of the search pulls the items after it

Given an unpinned submenu a person held by a press in the field of the search
When the panel stands at the whole allowed width
Then the item goes after it and takes that width: a limit counted from the former width of the panel would
leave on the right an empty strip of half the panel — exactly what the panel was widened for

Not covered: the width cannot be taken by a spec — it is held by the design, and the styles of a component
are not applied in a spec. Closed by the show `SubMenuHeldBySearch`
(`projects/ui-kit/src/lib/ui-kit/side-menu/stories/side-menu.stories.ts`): it holds the submenu by the field,
demands a grown panel and measures a row of the list against its width. Before the fix it fell at the former
limit with the numbers 240 against 480.

### SC-UK-42 — a list that did not fit by the height says so

Given a list in a scrollable area with the sign switched on
When something not shown is left below
Then a fading and the icon of an arrow down with a hint stand at the lower edge: an edge cut evenly by the
footer reads as the end of the list, and a person counts an item as lost. A scroll to the end lifts the sign,
and an area without the input switched on never shows it — the look of its other consumers does not move

Covered: `projects/ui-kit/src/lib/ui-kit/scrollable/scrollable-container.component.spec.ts`.

### SC-UK-43 — the sign is visible in the menu itself

Given a menu whose items did not fit by the height of the screen
When a person looks at the strip of the icons or at the list of the submenu
Then the sign stands at both: a different behaviour of two lists of one menu reads as a defect

Not covered: the sign cannot be taken by a spec — it is shown by the design, and the styles of a component
are not applied in a spec. Closed by the frame `MenuScrollHint`
(`projects/ui-kit/src/lib/ui-kit/side-menu/stories/side-menu.stories.ts`): the frame is shot on a low window,
and on it the fading and the arrow are visible at the lower edge of the strip of the icons.

### SC-UK-44 — a press on the icon leads the list to the very bottom

Given a list with the sign of something not shown below
When a person presses the icon of the arrow
Then the list goes away to the very bottom by a movement, not by a jerk, and the sign is lifted by itself.
The press stops at the icon and does not go into the list under it: under the icon there is a live item, and
a person who aimed at the hint would go away to a foreign screen

Covered: `projects/ui-kit/src/lib/ui-kit/scrollable/scrollable-container.component.spec.ts`.
The fading at that is painted by the colour of the theme: the start is taken by the same colour with a zero
transparency, not by the word "transparent" — transparent is black with a zero transparency, and on a dark
theme such a gradient goes through dirt. The measurement: the light theme — from `srgb 1 1 1 / 0` to white,
the dark one — from `srgb 0.11 0.11 0.12 / 0` to `rgb(28, 27, 30)`.

### SC-UK-45 — the fading goes after the chosen colour scheme

Given an application with a chosen colour scheme — a palette of a brand of its own
When the list shows the sign of something not shown below
Then the fading is painted by the soft filling of the accent of that scheme, not by a neutral ground: a strip
that took the ground stands of one colour in all the schemes and reads as a foreign one in a repainted
application. The light and the dark themes are set apart by the token itself, and no second declaration under
a theme is created

Not covered: this cannot be taken by a spec — `var()` is resolved by the browser, and there the fading
coincides with itself at any scheme. Closed by the show `MenuScrollHint`
(`projects/ui-kit/src/lib/ui-kit/side-menu/stories/side-menu.stories.ts`): the show puts the rows of the role
at the root of the page — the same as what the block `[data-rt-scheme]` puts — and asks for the computed
colour before and after. The measurement of four combinations: the light theme by default —
`rgb(234, 237, 252)`, the light one on the scheme of the turquoise — `rgb(179, 227, 225)`, the dark one by
default — `srgb 0.137 0.18 0.248`, the dark one on the same scheme — `srgb 0.09 0.181 0.188`.

### SC-UK-46 — the fading reaches the content of the footer

Given a list with the sign of something not shown below and a footer under it
When a person looks at the joint of the list and the footer
Then the fading ends where the content of the footer begins: the divider is drawn by the consumer as its
first row, and a strip that broke off at the edge of the list leaves a band of clean ground up to it — the
joint reads as a crooked layout. The upper padding of the footer the consumer writes as they like — by one
value, by two, by four — and it cannot be subtracted in the styles, so the rise of the strip over the bottom
of the area is taken by a measurement

Not covered: the place of the strip is held by the design, and the styles of a component are not applied in a
spec — the area there has a zero height. Closed by the show `MenuScrollHint`
(`projects/ui-kit/src/lib/ui-kit/side-menu/stories/side-menu.stories.ts`): it measures the distance from the
bottom of the strip to the first row of the footer, and before the fix it broke off 16 pixels higher.

### SC-UK-47 — the lists of the menu are scrolled by a narrow bar of their own

Given a menu whose list did not fit by the height
When a person looks at its right edge
Then the bar of the scroll is narrow, with a flat track and a rounded slider, and it is the same at both
lists — of the strip of the icons and of the submenu. The one of the system takes a noticeable share of the
width at a narrow panel and looks its own way in every system, while at the table and at the dropping lists
of the kit the bar is already its own, and a menu with the one of the system reads as unfinished. The light
and the dark theme are set apart by the tokens of the slider and of the ground

Not covered: the place taken by the bar cannot be taken by a spec, and the browser of the visual run draws
the bars over the content — the difference of the full and the inner width at it is zero at any design.
Closed by the show `MenuScrollbar` (`projects/ui-kit/src/lib/ui-kit/side-menu/stories/side-menu.stories.ts`):
it asks for the declaration — the rule of the bar in the sheets, the width and the colour of the track by the
properties of the menu's own — and measures the width by a node, it does not count it itself. The measurement
in an ordinary browser: the bar is 2 pixels at both lists, the track is `light-dark(#e0e0e0, #3f3e43)`, the
slider is `light-dark(#a3a3a3, #747474)`, the rounding of the slider is 4 pixels. The values are taken from
the sample shown by the owner.

### SC-UK-48 — the list of the submenu steps back from the rounded corner of the panel

Given a panel of a submenu with rounded right corners
When its list is scrolled
Then the list ends by the radius above the lower corner: the panel cuts everything that goes into the corner,
and the bar of the scroll going by the right edge to the very bottom loses its end in it — that reads as a
chopped-off bar, not as a rounding of the panel. The radius is declared by a property of the menu's own and
serves both numbers at once — the rounding of the panel and the step back of the list — otherwise they go
apart

Not covered: the cutting by the corner is visible only on a drawn panel, and a spec does not know the sizes
of the panel — its height there is zero. The measurement in an ordinary browser: the bottom of the list is
415 at the lower edge of the panel of 431, the reserve is 16 pixels — exactly the radius.

### SC-UK-49 — the handle of the pull is caught by the cursor wider than it is visible

Given a panel of a submenu whose edge is pulled by the cursor
When a person leads the cursor to its edge
Then the handle is caught by a zone three times wider than the visible strip, and the strip itself stands in
the same place and of the same width: landing into four pixels does not work at the first try, and a miss
past the handle lands into the panel — that is, instead of a pull a person presses an item. The strip inside
the zone is painted at a hovering, not the whole zone: painted whole, it would read as another design, not as
the same one with a bigger target

Not covered: the handle stands at the edge of a drawn panel, and the styles of a component are not applied in
a spec — the panel there has a zero width, and there is nothing to measure. Closed by the show
`MenuResizerGrab` (`projects/ui-kit/src/lib/ui-kit/side-menu/stories/side-menu.stories.ts`): it measures the
width of the node of the handle, the width of the visible strip and the place of its right edge. The
measurement in an ordinary browser: the zone of the catching is 12 pixels against the former 4, the strip is
still 4, its right edge is 328 at the right edge of the panel of 328.

### SC-UK-50 — a pinned panel has nothing to show: it takes no place

Given the mode is the pinned one, and the active address has no sections
When the menu is drawn
Then the panel is not marked as open and there is no handle of the pull in the markup

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-51 — a press of an item of the strip moves the pinned submenu

Given the mode is the pinned one and an item of the strip with sections of its own
When the item is pressed
Then the submenu shows its sections with an empty query, and that is true even when the active item carries
sections of its own

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-52 — a transition to a page without sections lifts the pinned submenu

Given the mode is the pinned one and an open submenu of a section
When an item with an address of its own and without sections is pressed, and the input of the activity named
it active
Then the submenu is empty and the panel is not marked as open

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-60 — the panel of the submenu keeps its place at a walk of the strip

Given an open submenu of a section
When the active item of the submenu is brought into the visible part, as it is at every change of the section
Then the panel stays where it stood, and the container of the drawer is not scrolled: a panel returned into
the flow stands over the content of the container and makes the container twice as tall as itself, and then
one bringing into view carries the panel upwards by the width of the strip and does not bring it back

Not covered: the drift is held by the placement of the drawer, and the styles of a component are not applied
in a spec — the container there has no height of its own, and there is nothing to measure. Closed by the show
`SubMenuKeepsItsPlace` (`projects/ui-kit/src/lib/ui-kit/side-menu/stories/side-menu.stories.ts`): it measures
the height of the content of the container against its own, and the top of the panel before and after the
bringing of an item into view.
