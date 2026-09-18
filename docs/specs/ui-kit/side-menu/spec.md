# The second level of the side menu

**Status:** in force · **Revision:** 2026-09-06 · **Scenario prefix:** `SC-UK`
**Depends on:** none
**Laws:** `frontend-application`, `reuse-first`
**Procedures:** none

A subdomain of the first kit about the second level of the side menu: what a submenu is held open by, what
is visible in it at a pinning and how an item is found in it.

## Why

The submenu opened at a hovering and closed at the leaving of the pointer. A person who works in one
section the whole day had to open it anew at every action, and an item in a long list could be found only
by the eye. The subdomain names what the submenu is held open by, what a pinned panel shows and when it
takes no place, how the search filters the items and where the kit stops: the preference is kept by the
consumer, the address of the active item the kit does not count.

## Terminology

| Term                    | What it is                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------- |
| The strip               | The first level of the menu: a narrow column with the items of the sections            |
| A submenu               | The second level: a panel with the sections of an item of the strip                    |
| The mode of the submenu | The input the consumer names what the submenu is held open by by                       |
| A pinned submenu        | A submenu standing open permanently while the mode is the pinned one                   |
| The active item         | The item of the strip named active by the input of the activity                        |
| A query                 | The text in the field of the search of the submenu; it lives while the submenu is open |
| The handle of the pull  | The strip at the edge of a pinned submenu its width is changed by                      |

### What it is called in the interface

| In the domain           | On the screen                                                           |
| ----------------------- | ----------------------------------------------------------------------- |
| The mode of the submenu | the switch of the pinning at the footer of the strip                    |
| A pinned submenu        | a panel standing to the left of the page permanently, without a backing |
| A query                 | the field of the search above the list of the submenu                   |
| An empty filter         | a line saying that there are no coincidences, instead of the list       |
| The handle of the pull  | a thin strip at the right edge of the panel, painted at a hovering      |

## Rules

- **The mode of the submenu arrives by an input, and the default is today's behaviour.** A consumer who did
  not name the mode gets a submenu that opens at a hovering and closes at the leaving of the pointer.
- **A press of the switch does not change the mode but asks for it.** The kit gives outward the mode a
  person asked for and waits for it back by an input: the preference is kept by the consumer, the kit
  creates no state of its own about it and does not go into the storage of the browser.
- **A pinned submenu shows the active item.** Which item is active the kit learns by the input of the
  activity; it has no computing of its own by the address.
- **The pinning does not change what is visible.** There is no active item — pinned stays the submenu that
  was open at the minute of the press: a person pins what is in front of them, and they must not lose it by
  a press. Nothing is open and there is no active item — there is no submenu either.
- **A press of an item of the strip moves the pinned submenu onto its section.** A hovering at a pinning
  still does nothing — the hand goes along the strip to the footer and to the panel itself, and the submenu
  would flicker with the sections on the way. For a section that has no address of its own a press stays the
  only way to open it; without that a person is locked in the section they began at. The chosen section
  stands ahead of the active one: otherwise the submenu of the active address comes back at every press.
- **An item with an address of its own and without sections lifts the pinned submenu.** The person left for
  a page that has no sections, and a panel of the former section would lie about where they stand.
- **A pinned panel that has nothing to show takes no place.** Neither a width nor a handle of the pull: a
  width put by the pinning alone leaves an empty strip to the left of the page at every address without
  sections, and there is nothing to pull the edge of an invisible panel by. The choice of the mode at that
  is not lifted: a section that has a submenu shows it pinned, as before.
- **A pinned submenu closes neither at the leaving of the pointer nor at a transition by its own item.**
  Otherwise the pinning is cancelled by the very first action of the person.
- **There is no backing under a pinned submenu.** It puts out the rest of the page and catches the presses;
  at a panel standing open permanently that makes the page unworkable.
- **The field searches over the open submenu, not over all the sections.** The result stays belonging to the
  section: a search over the whole application is another subject.
- **The filter goes by a substring of the label without a count of the case, and an empty query shows
  everything.** There are no coincidences — the submenu says so by a line: an empty panel cannot be told
  from a breakage.
- **The filter goes down into the folders of the submenu, and only rows carrying the query stay.** A
  consumer puts what a person looks for by name inside a folder, so a filter over the top level alone could
  not match it by construction. A folder is no exception from the rule but the path to what coincided: its
  makeup is filtered the same way, whether the label of the folder itself coincided or not. Otherwise one
  coincidence by the name of a folder drags its whole makeup onto the screen, and a person reads as found
  what carries no query at all. A folder whose label coincided while nothing inside it did stays a single row
  without items: it was looked for by name and must be found. An item that has no makeup at all stays an
  item — an empty makeup is not ascribed to it.
- **A folder that survived the filter stands open.** The found item lies behind a closed header otherwise,
  and the person needs one more press to see what they have already found. Openness is not the same as
  activity: active stays the address the person stands on, and one value for both would open only the folder
  of the current address — that is, hide exactly what was looked for. An empty query gives the former
  openness back.
- **The field of the search owns the focus and hands the keys to the list.** The focus never leaves the
  field, so the typing keeps working between presses of the arrows; the focus set on the items of the list
  would break the typing of the query at the very first arrow. Only the keys the walk goes by are eaten — the
  rest reach the field untouched and cancel no default.
- **The arrows walk the visible list, Enter opens the highlighted item, Escape empties the query.** The
  highlight goes down the list the way it stands on the screen and enters a folder only while that folder is
  open; the arrow to the right opens the highlighted folder, the one to the left closes it. Enter presses the
  very row a pointer would press — a press assembled in code would go past everything hanging on the real one.
  The highlight is kept by the number of the item, not by a reference to it and not by its place in the list:
  the visible list is rebuilt at every letter of the query.
- **The magnifier and the cross of the emptying stand at one inset from their edges.** The inset of the cross
  comes from the geometry of the ready-made button rather than from a step of the scale, so the magnifier is
  brought to the nearest step by a measurement on the showcase, not by a number chosen by the eye. The inset
  is counted from the edge of the field: the wrapper of the ready-made field carries a side inset of its own,
  and its value depends on the set the consumer took. Left as it comes, it adds itself to the inset of the
  icon, and the same kit stands one way on the showcase and another in an application.
- **The item under the highlight of the keyboard is marked by a ring, not by a fill.** The fill is already
  taken by the active address, and two different meanings by one look would read as one.
- **The query lives while the submenu is open.** It is not a preference: a submenu closed and opened anew
  shows the list whole.
- **The labels of the field, of the switch and of the empty filter are sewn in in English.** The kit has no
  dictionary, and the neighbouring label — the button of the return to the main list — is sewn in the same
  way.
- **On a narrow screen there is no pinning, and there is a search.** The submenu there takes the screen
  whole, and there is nothing to pin; there is no switch in the narrow layout at all.
- **The submenu keeps its place while the pointer walks the strip.** Moving across the items of the first
  level one after another moved the panel upwards by the width of the strip, and it did not come back: the
  head of the panel with the search field left above the top edge of the screen. The panel is laid out by
  the drawer of the framework, which puts it over its container rather than into the flow; a panel put into
  the flow makes the container twice as tall as the screen, and then one bringing of the active item into
  view scrolls the container together with the panel.

## What is out of scope

- **A separate component of the submenu.** The second level stays a part of `rtui-side-menu`.
- **A computing of the active item by the address of its own.** The activity arrives to the kit by an input.
- **A search over the whole application.** Its result does not belong to a section, and that is another
  subject.
- **The other subjects of the first kit.** The cell, the spinner, the curtain and the sorting of the table —
  the spec of the domain next to it.

## Contract

Not applicable: the surface of the subdomain is the inputs and the outputs of `rtui-side-menu`, it serves
no procedures.

### Refusal codes

Not applicable: the submenu has no refusals of its own.

## Data

The submenu has no records of the storage of its own: the mode and the activity arrive by the inputs, and
the preference is kept by the application that installs the kit.

## Screens and states

| The state of the submenu                                              | What is visible                                                                   |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| the mode is not named, the pointer is on an item of the strip         | the submenu of the section; the leaving of the pointer closes it                  |
| the mode is the pinned one, the active address has sections           | the panel is open permanently, there is no backing, there is a handle of the pull |
| the mode is the pinned one, there are no sections and nothing is open | there is no panel, it takes no place                                              |
| at a pinning an item of the strip with sections is pressed            | the submenu of its sections with an empty query                                   |
| at a pinning an item with an address and without sections is pressed  | the submenu is lifted                                                             |
| a query is entered                                                    | the items with a coincided label, the coincidence is marked                       |
| there are no coincidences                                             | a line about an empty filter                                                      |
| a narrow screen                                                       | the submenu over the whole screen, there is no switch, there is a search          |

## Cross-cutting requirements

### Locales

The labels of the field, of the switch and of the empty filter are sewn in in English: the kit has no
dictionary.

### SEO

Not applicable: the kit stands in applications behind an entry, and its markup is read by not a single
gatherer of a search engine.

### Mobile layout

On a narrow screen the submenu takes the screen whole: there is no pinning and no handle of the pull, there
is a search.

### Several objects

Not applicable: the kit knows nothing either about the owner of the data or about a division by objects.

## Decisions

- **The preference of the mode is kept by the consumer, not by the kit.** The argument: the kit gives
  outward the mode a person asked for and waits for it back by an input; the kit has no state of its own
  about it. Rejected: a write of the kit into the storage of the browser — a second place of the preferences
  next to the one of the consumer.
- **An empty pinned panel is removed from the markup, it is not drawn empty.** The argument: a width put by
  the pinning alone left an empty strip to the left of the page at every address without sections. Rejected:
  a panel with a label saying that there are no sections — it takes the same place.
- **A section chosen by a press stands ahead of the active one.** The argument: otherwise the submenu of the
  active address would come back at every press of an item of the strip. Rejected: a hovering at a pinning —
  the hand goes along the strip, and the submenu would flicker with the sections on the way.

## Open questions

The subdomain has no open questions.

## History of changes

- 2026-09-06 — the subdomain was split out of the spec of the first kit, which had outgrown the length
  limit. The rules, the scenarios and the bindings about the second level of the side menu moved as they
  were: the scenario numbers were not recounted.
- 2026-09-09 — the submenu stopped drifting upwards at a walk of the strip (RT-1975).
- 2026-09-17 — the pull of the width moved onto pointer events with a capture, and its beginning
  and end went outward as events of their own, and the number going outward stopped lying about
  the width of the panel; the width began to change from the keyboard, and the reader began to
  name it (RT-2142).
