# The first kit

**Status:** in force · **Revision:** 2026-09-06 · **Scenario prefix:** `SC-UK`
**Depends on:** none
**Laws:** `frontend-application`, `reuse-first`
**Procedures:** none

The domain holds five subjects: the button of the copying at an empty cell of a table, the delay of the
showing of a spinner, what a curtain is closed by, the column the table gives the sorting by, and the
choice of the outcome at fast repeated calls. The second level of the side menu — what it is held open by
and how an item is found in it — lives as a subdomain next to it. Every subject answers a question of its
own about the surface of a component, not about a check of the look.

## Why

The first kit stands in the applications that install it, and it changes only together with them: a
component inserted in five places has no screen of its own on which a miss would be visible. Hence the
subject of the domain — the promises of the inputs and the services of the kit, not how it is drawn.

Three promises are named here because each of them cost a person a lost action. The button of the copying
hung at an empty cell and put the word "null" into the clipboard. The spinner appeared at the same moment
as the waiting and at a fast answer gave a flash read as a jerk of the screen. The curtain closed at Esc,
and a filled form went away together with it.

## Terminology

| Term                       | What it is                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| A copyable column          | A column declared copyable by the setting of the table; the sign stands at the whole column |
| An empty cell              | A cell whose value after the transformation of the column is empty                          |
| The delay of the showing   | The time from the insertion of the spinner until it becomes visible                         |
| A flash                    | A showing of the spinner for a time a person perceives as a jerk of the screen              |
| A curtain                  | A panel driving out over the page from the side                                             |
| A source of the closing    | The event the curtain closes by: the backing, a key, a transition                           |
| The setting of the opening | The argument the consumer names what the curtain is closed by by                            |

### What it is called in the interface

| In the domain             | On the screen                                                |
| ------------------------- | ------------------------------------------------------------ |
| An empty cell             | a dash instead of the value                                  |
| The button of the copying | the icon of the copying, shown at a hovering over the cell   |
| The delay of the showing  | the input `delay` in milliseconds                            |
| A flash                   | a circle of the waiting that blinked and disappeared at once |
| A curtain                 | a panel driving out on the right or on the left              |
| The backing               | the darkening under the curtain                              |

## Rules

The subjects of the domain go one after another: first the button of the copying at an empty cell of a
table, then the delay of the showing of a spinner, then the sources of the closing of a curtain, then the
column of the sorting, then the choice of the outcome at fast repeated calls. The second level of the side
menu — what it is held open by and how an item is found in it — lives as a subdomain of its own: the domain
outgrew the length limit. The table of the subdomains stands after the rules.

- **The button of the copying is not shown at an empty cell.** There is nothing to copy, and a press puts
  the word "null" into the clipboard: a person carries it on without noticing the substitution.
- **Empty counts as the same as what the kit counts empty everywhere.** The emptiness is taken by a ready
  utility of the kit, not by a condition of one's own in the template: two answers to the question "is it
  empty" diverge silently — in the table there is a dash, and the button is there at that.
- **The sign of the copyability of a column stays at the column.** A cell judges only its own value; the
  column is still declared copyable whole, and at the non-empty cells the button is the former one.
- **A cell with a value behaves as before.** The same showing at a hovering, the same position, the same
  hint and the same message about the copying that took place.

- **The spinner waits for the delay and only then becomes visible.** A waiting that ended earlier than the
  delay shows no spinner at all: there is nothing to show — the answer has already arrived.
- **The default of the delay is zero.** A spinner inserted without a delay behaves as before: the edit
  changes not a single one of the places where it already stands.
- **The delay is counted from the insertion of the spinner, not from the first redrawing.** A count begun
  later stretches the waiting for a time unknown to the person.
- **A spinner lifted before the term takes its counter away with it.** A postponed showing that lived to an
  already lifted component would draw a circle over a ready screen.
- **The delay lives in the spinner itself.** It is inserted by five places of the kit and by any
  application; a delay of its own at each would mean five different answers to one question.

- **The key Esc does not close the curtain.** It is pressed to lift a hint or to leave a field, and the
  whole panel closed together with what was entered.
- **The former behaviour stays available by the setting of the opening.** A screen that needs the closing by
  a key names it itself — the default does not decide for it.
- **A click on the backing and a leaving by a route close the curtain as before.** The work answers for one
  key, not for all the sources of the closing at once.
- **A forbidden source is not subscribed to at all.** A subscription that comes and does nothing reads as
  working and comes alive at the first edit next to it.
- **A programmatic closing is not put out by the setting.** A consumer closing the curtain by their own code
  says about their intent openly, and the ban of the sources does not concern them.

- **The table gives the sorting only by the column it draws itself.** The name of the column arrives to it as
  a string, and outward it goes as a key of a record: a column that is not in the set went away to the
  consumer as a lawful value, and neither the build nor the types saw that.
- **The name is checked against the same set of the columns the table draws.** It has no second list of the
  names, and there is nothing for it to diverge with.
- **A name that did not coincide does not go outward at all.** No refusal is created at that: the kit writes
  no messages of an error of its own anywhere, and the consumer did not ask for a sorting by a column they
  did not declare.

- **The setting of the table is shown by the last reading, not by what answered last.** The composition of
  the columns changes together with the screen, and what was read under the former composition does not
  concern the present one any more.
- **A write and a lifting of the setting reach the storage in the order of the calls.** A lifting that
  outran a write leaves the lifted one in the storage, and that can be seen only at the next opening of the
  screen.
- **The panel of the setting of the columns opens as one.** A second press at an open panel has nothing to
  open, while before every one created a subscription of its own — the setting was saved by the panel that
  closed last.

| Subdomain                                                                               | About what                                                                                               |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [The second level of the side menu](side-menu/spec.md)                                  | the mode of the submenu, a pinned panel, the search over a submenu, the width and the pull               |
| [The look of a field of input in the setting of the kit](form-field-appearance/spec.md) | where the components take the look of a field of input from and in which order the values are overridden |

## What is out of scope

- **The second kit.** Its cell of the copying, its spinner and its curtain are a package of its own with
  selectors of its own and a domain of its own; the same oversight there is created as a task of its own.
- **The least time of the showing of a spinner.** A spinner that showed for a moment and disappeared is a
  work of its own: the delay lifts the flash itself, and a second time adds a jerk of its own at the end.
- **The skeletons and the stubs.** They answer another question — what to occupy a place by, not when to show
  a waiting.
- **The bringing of a value to a string at the copying.** The empty stops being copied together with the
  button.
- **The mobile list of the table.** It does not draw the base cell at all.
- **A ban of the closing of a curtain on the fly.** The unsaved edits are guarded by a work of its own.
- **The window and the modal window of the first kit.** They have a service of their own and a set of the
  sources of the closing of their own.
- **The debt on the specs of the components.** The domain describes three subjects, and the kit has more
  components; the rest are merged when their agreements are written.
- **The second level of the side menu.** Its boundaries are named in the subdomain next to it.

## Contract

Not applicable: the surface of the domain is the inputs of the components and the arguments of the services
of the kit, it serves no procedures.

### Refusal codes

Not applicable: neither the showing nor the opening has refusals of its own.

## Data

The kit has no records of the storage of its own: the values arrive by the inputs from the application that
installs it.

## Screens and states

| The state of a cell                        | What is visible                                       |
| ------------------------------------------ | ----------------------------------------------------- |
| the column is copyable, there is a value   | the value and the button of the copying at a hovering |
| the column is copyable, the value is empty | a dash, there is no button                            |
| the column is not copyable                 | the value or a dash, there is never a button          |

| The state of a spinner                       | What is visible            |
| -------------------------------------------- | -------------------------- |
| the delay is not named                       | the spinner at once        |
| the delay is named, the term has not run out | nothing                    |
| the delay is named, the term has run out     | the spinner                |
| the waiting ended earlier than the term      | nothing for the whole time |

| What was pressed at the curtain      | What happens           |
| ------------------------------------ | ---------------------- |
| Esc, the setting is not named        | the curtain stays open |
| Esc, the closing by a key is allowed | the curtain closes     |
| a click on the backing               | the curtain closes     |
| a transition by a route              | the curtain closes     |

| The name of a column in the sorting | What goes away to the consumer |
| ----------------------------------- | ------------------------------ |
| coincided with a declared one       | the same column and direction  |
| coincided with none                 | nothing                        |

## Cross-cutting requirements

### Locales

Not applicable: the labels of the button of the copying arrive from the kit as one string, the spinner and the
curtain have no labels of their own.

### SEO

Not applicable: the kit stands in applications behind an entry, and its markup is read by not a single
gatherer of a search engine.

### Mobile layout

On a narrow screen the hint of the button of the copying is not shown — this is the former behaviour, and the
domain does not touch it. The delay of the showing does not depend on the width of the screen; there is no
key closing the curtain on a narrow screen.

### Several objects

Not applicable: the kit knows nothing either about the owner of the data or about a division by objects.

## Decisions

- **The emptiness is counted by a ready utility of the kit, not by a condition of the cell's own.** The
  argument: the dash instead of a value is drawn by the same emptiness, and two answers to one question would
  diverge silently. Rejected: a condition of one's own in the template — it knows only `null` and an empty
  string.
- **The button is removed from the markup, it is not switched off.** The argument: the snapshot of the owner
  shows an extra element, not a ban of a press. Rejected: an unavailable button — it stays visible and still
  promises the copying.
- **The delay is an input of the spinner, not a wrapper around it.** The argument: a wrapper demands an edit
  of every place of the insertion, and the spinner already stands in five places of the kit. Rejected: a
  directive of a postponed showing next to it.
- **The default of the delay is zero, not "a reasonable three hundred".** The argument: the edit must not
  change the behaviour of the places where the spinner already stands; the term is chosen by whoever knows
  what is being waited for. Rejected: a default of three hundred milliseconds — it would silently stretch
  every waiting of the kit.
- **The default of the curtain is that Esc does not close.** The argument: so it stands in the request of the
  owner, and the screens with forms are the majority. Rejected: to leave the default the former one and create
  a switch — then the request is carried out only where somebody remembers it.
- **The technique of the closing is taken from the neighbouring kit: the setting of the opening and a
  conditional stream.** The argument: there the curtain already accepts a setting and gives back an empty
  stream instead of a subscription. Rejected: a third decision of one's own — it would diverge from the
  neighbouring kit silently.

## Open questions

- `Q-1` — whether to count as empty a cell whose value consists of spaces alone. The domain stands on the
  assumption that no: so the utility of the kit answers, and a second answer next to it would diverge from the
  dash.
- `Q-2` — whether the spinner needs a least time of the showing in addition to the delay. The assumption: no
  — the delay lifts the flash itself, and a second time adds a jerk of its own at the end.
- `Q-3` — whether the curtain of the first kit needs a ban of the closing on the fly, as at the neighbouring
  one. The assumption: no — the guard of the unsaved edits is a work of its own, and it is that work that will
  demand it.

## History of changes

- 2026-09-06 — the second level of the side menu was split into a subdomain: the spec outgrew the length
  limit. The rules, the scenarios and the bindings moved as they were, the scenario numbers were not
  recounted.

- 2026-08-30 — a fifth subject was added to the domain: the choice of the outcome at fast repeated calls — the
  reading and the write of the setting of the table, the opening of the panel of the setting of the columns.

- 2026-08-29 — a fourth subject was added to the domain: the sorting the table gives the consumer is checked
  against the set of its columns.

- 2026-08-24 — the domain was created by the word of the owner and put together from three agreements written
  before the code and rolled out by branches of their own: the button of the copying at an empty cell, the
  delay of the showing of a spinner and the sources of the closing of a curtain. The scenario numbers moved as
  they were.
