# Scenarios — the width of a pinned panel of the side menu

The identifier goes at the start of the test title, followed by a dash. The prefix is shared across the
domain, and the numbers were not recounted at the move into the subdomain: the number ties a scenario to
the title of its test.

## The limits of the width and the choice of the consumer

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

### SC-UK-38 — the submenu is never narrower than the width set by the design

Given the consumer set the width of the submenu by their own design
When a person pulls the edge of the panel to the left further than that width
Then the panel stops at the set width and does not become narrower: the lower limit is held by the design
itself, not by a number in the kit — the width is known by the consumer, and a number of one's own would
diverge from it at every second one. The pull to the right widens the panel as before

Not covered: the limit is held by the rule `max(...)` in the design, and the styles of a component are not
applied in a spec — the width of the panel there is zero. Taken by a measurement in the browser: the width
set by the design is 240 pixels, the pull to the left leaves 240, the pull to the right gives 358.

## The pull of the handle

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

### SC-UK-35 — the edge of a pinned submenu is pulled by the pointer

Given a pinned submenu
When a person takes its right edge and leads it by the pointer
Then the panel goes after the hand within the limits of the width, and at the release the width goes away
as a request outward — it is kept by the consumer, as the mode is; an unpinned submenu has no handle at all:
it lives by the hovering and leaves the screen before the hand reaches the edge

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-125 — the handle is pulled by a pen and by a finger

Given the mode is the pinned one and an open submenu
When the handle gets a pointer press of a pen, then a movement to the right and a release
Then the panel follows the movement, and the asked width goes away outward at the release

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-126 — a pointer taken away by the environment ends the pull

Given the mode is the pinned one and a pull begun
When the environment takes the pointer away — a gesture of the system, a call
Then the pull ends the same way a release ends it: the width reached goes away outward, and the
listeners of the movement are taken off

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-127 — the beginning and the end of the pull go outward

Given the mode is the pinned one and an open submenu
When the handle is pressed, led and released
Then the event of the beginning goes outward once and the event of the end goes outward once

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-128 — a pull taken away by the environment ends outward too

Given the mode is the pinned one and a pull begun
When the environment takes the pointer away instead of a release
Then the event of the end goes outward all the same: a consumer who put a cover up at the beginning
takes it down in both cases

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-129 — the number that goes outward matches the drawn width

Given the consumer set the width of the submenu by their own design, wider than the lower limit of the kit
When a person pulls the edge to the left past that width, and the panel stops at it
Then outward goes the width the panel is drawn by, not the one the hand pulled to

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

## The keyboard and the reader

### SC-UK-130 — the arrows move the width by a step

Given the mode is the pinned one and a width named by the consumer
When the handle has the focus and the arrow to the right is pressed, then the arrow to the left
Then the width asked outward grows by a step and then comes back by the same step

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-131 — Home and End take the width to the limits

Given the mode is the pinned one and a width named by the consumer
When the handle has the focus and `Home` is pressed, then `End`
Then outward goes the lower limit of the kit and then the upper one

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-132 — a key leads no pull, and the events of the pull do not come about

Given the mode is the pinned one and a width named by the consumer
When the width is changed by the arrows
Then neither the event of the beginning nor the event of the end goes outward

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.

### SC-UK-133 — the reader names the width and both limits

Given the mode is the pinned one and a width named by the consumer
When the handle is looked at
Then it stands in the walk by the tab key and carries the current width and both limits of the kit; the
consumer named no width — there is no number, and the kit invents none

Covered: `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts`.
