# The width of a pinned panel of the side menu

**Status:** in force · **Revision:** 2026-09-17 · **Scenario prefix:** `SC-UK`
**Depends on:** `docs/specs/ui-kit/side-menu`
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the first kit about one thing: the width of a pinned submenu panel. Who owns the number,
what the panel is drawn by, how a person changes it and what the kit says about it outward.

## Why

The width was pulled by the mouse alone, and the number the kit gave outward was not the one the panel
stood at. A finger and a pen give no mouse events, so on a tablet the edge could not be taken at all; a
person who does not work with a pointer could not change the width by any key; and a reader announced the
handle as a nameless divider. The subdomain names who owns the number — the consumer — what the kit
counts itself, and where the limits of each lie.

## Terminology

| Term                   | What it is                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------- |
| A pinned panel         | The second level of the side menu standing open permanently                            |
| The handle of the pull | The strip at the right edge of a pinned panel its width is changed by                  |
| The pulled width       | The width the hand led the handle to, while the pull runs                              |
| The drawn width        | The width the panel actually stands at: the greater of the pulled one and the design's |
| The limits of the kit  | The lower and the upper bound the kit brings any width to                              |

### What it is called in the interface

| In the domain          | On the screen                                                      |
| ---------------------- | ------------------------------------------------------------------ |
| The handle of the pull | a thin strip at the right edge of the panel, painted at a hovering |
| The pulled width       | the panel following the hand while the edge is held                |
| The limits of the kit  | the panel stopping and not following the hand any further          |

## Rules

- **The handle of the pull is caught wider than it is visible.** The zone of the catching and the visible
  strip are two different numbers: into four pixels the cursor does not land at the first try, and a miss
  past the handle lands into the panel, that is, instead of a pull a person presses an item. The zone is
  three times wider and stands at the centre of the former place, and the strip inside it is painted at a
  hovering — a zone painted whole would read as another design.

- **The pull is caught by pointer events, and the handle holds the pointer by a capture.** A finger
  and a pen give no mouse events at all, so a handle listening for a press of the mouse is workable
  by the mouse alone. The capture keeps the movement and the release on the handle itself: listeners
  put on the document lose the movement the minute the pointer goes over a frame of a foreign
  address, and the panel stays stuck at the width of that minute. A pointer the environment takes
  away — a gesture of the system, a call — ends the pull the same way a release does.

- **The beginning and the end of the pull go outward as events of their own.** A consumer does what
  the kit has no business doing for them: they put a cover over a frame of a foreign address, change
  the cursor of the whole page, hold back a re-layout of what stands to the right of the panel. The
  minute the pull begins and the minute it ends is the only thing they lack for that. Without those
  events the only sign left them is the class of the handle — the kit's own matter, which the first
  rename inside the kit takes away silently. The end comes about at a release and at a pointer taken
  away alike: a consumer who put a cover up at the beginning must take it down in both cases.

- **The number that goes outward is the one the panel is drawn by.** The lower limit of the width
  belongs to the design, not to the kit: a panel is never narrower than the width the consumer set
  by their own rule, and the kit does not know that number at all. So a pull to the left past it
  stops the panel and does not stop the count — outward went the pulled number while the panel
  stood at the set one. A consumer who keeps what they were given and hands it back sees no change
  of the panel and reads that as a breakage of the kit. What is measured is the drawn width itself,
  and the greater of the two goes outward: the design holds the limit by a maximum, so the drawn one
  is never below the pulled one. Where the layout is not computed at all — a spec raising the
  component without its styles — a measurement gives nothing, and the pulled number stands.

- **The width is changed from the keyboard, and the handle stands in the walk by the tab key.** A
  person who does not work with a pointer had no way to change the width at all: the handle was
  reached neither by the walk nor by a key. The arrows move the width by a step, `Home` and `End`
  take it to the limits of the kit. A press asks the consumer for the width at once — a pull holds
  the ask to the end of the gesture because there is a gesture; here there is none. The events of
  the beginning and the end of the pull do not come about from a key either: a consumer covers a
  frame of a foreign address for the time a hand leads the pointer, and a key leads nothing.
      <!-- rt-when: *.ts *.html -->

- **The reader names the current width and both its limits.** A handle that says only "separator"
  tells a person nothing about what the keys under their fingers will do, and nothing about where
  the width already stands. The numbers are the kit's own count — the width the consumer named or
  the one the hand pulled to. The consumer named none and nothing was pulled — there is no number,
  and the kit does not invent one: a number made up would name a width the panel is not drawn by.
      <!-- rt-when: *.ts *.html -->

## What is out of scope

- **The keeping of the chosen width.** The consumer keeps it, as they keep the mode: the kit creates no
  state of its own about it and does not go into the storage of the browser.
- **The width of an unpinned submenu.** It is opened by a hovering and has no handle at all — the spec of
  the subdomain next to it.
- **The narrow screen.** There is no pinning there, so there is nothing to pull: the submenu takes the
  screen whole.

## Contract

Not applicable: the surface of the subdomain is the inputs and the outputs of `rtui-side-menu`, it serves
no procedures.

### Refusal codes

Not applicable: the width has no refusals of its own — a number past the limits is brought to them rather
than refused.

## Data

The subdomain has no records of the storage of its own. The width arrives by an input, and the choice of a
person is kept by the application that installs the kit.

## Screens and states

| The state                                               | What is visible                                                 |
| ------------------------------------------------------- | --------------------------------------------------------------- |
| the mode is the pinned one, there is a submenu          | a panel with a handle at its right edge                         |
| the pointer is over the handle                          | the strip inside the catching zone is painted                   |
| the edge is held and led                                | the panel follows the hand within the limits of the kit         |
| the hand went past a limit                              | the panel stopped and does not follow further                   |
| the hand went left past the width set by the design     | the panel stands at the set width, and that number goes outward |
| the handle has the focus and an arrow is pressed        | the panel is a step wider or narrower                           |
| the mode is the pinned one and there is nothing to show | there is no panel and no handle: they take no place             |

## Cross-cutting requirements

### Locales

The label of the handle is sewn in in English: the kit has no dictionary, and the neighbouring labels of
the submenu are sewn in the same way.

### SEO

Not applicable: the kit stands in applications behind an entry, and its markup is read by not a single
gatherer of a search engine.

### Mobile layout

On a narrow screen there is no pinning and no handle: the submenu takes the screen whole.

### Several objects

Not applicable: the kit knows nothing either about the owner of the data or about a division by objects.

## Decisions

- **The lower limit of the width belongs to the design, and the kit holds no number for it.** The
  argument: the width is known by the consumer, and the kit's own number would diverge from theirs in
  every second tree. Rejected: an input for the lower limit — a second place for a number the design
  already holds.
- **The pull goes by pointer events rather than by three sets of listeners side by side.** The argument:
  one source instead of three, and the capture holds the pull where a listener on the document loses it.
  Rejected: listeners of the touch next to the mouse ones — three branches about one thing would diverge
  silently.
- **A key asks for the width at once, and a pull asks at the end of the gesture.** The argument: a pull
  has a gesture to hold the ask to the end of; a key has none. Rejected: holding the ask by a countdown
  after the last key — a countdown answers about the machine, not about the hand.

## Open questions

The subdomain has no open questions.

## History of changes

- 2026-09-17 — the subdomain was split out of the spec of the second level of the side menu, which had
  outgrown the length limit. The rules, the scenarios and the bindings about the width moved as they were:
  the scenario numbers were not recounted. By the same work the pull moved onto pointer events with a
  capture, its beginning and end went outward as events of their own, the number going outward stopped
  lying about the width of the panel, the width began to change from the keyboard and the reader began to
  name it (RT-2142).
- 22 September 2026 — the main branch merged into the epic branch brought the favourites with the
  numbers SC-UK-69…SC-UK-77 already in force. The nine scenarios of the pull, issued in the epic branch
  alone, moved to SC-UK-125…SC-UK-133, and their tests moved with them.
