# The expansion panel

**Status:** in force · **Revision:** 30 September 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the icon of the kit — the chevron is its `chevron-down`; the design of the kit — the
surface, the shadow, the spaces and the durations come from its appointments
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written by task RT-2440. The owner chose a primitive of the
kit's own for what the first kit draws with the Material expansion panel.

## Why

The first kit draws the folders of the side menu and its favourites block with the Material
expansion panel. The second kit carries no Material. The ported side menu drew each of the two with
a button and a chevron of its own: two copies of one technique, and a third place would write a
third. `rt-accordion` holds items given as data and projects no markup, so a menu row with icons,
marks and buttons cannot stand in it.

## Terminology

| Term       | What it is                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| the header | the button across the whole width: the owner's content and the chevron     |
| the body   | what opens under the header                                                |
| expanded   | the panel whose body is visible                                            |
| lazy body  | the body given by a template, created on expanding and gone after collapse |
| the owner  | the component that places the panel and keeps its expanded state           |

### What it is called in the interface

| In the agreement | On the screen                                 |
| ---------------- | --------------------------------------------- |
| the header       | a line with a title and an arrow at the right |
| the body         | the content under the line                    |
| expanded         | the content is shown, the arrow points up     |

## Rules

- **Everything the owner puts into the panel outside a body mark is the header.** The panel knows
  nothing of what the header shows and adds no text of its own.
- **The body is given either by a template created on expanding or by a marked node created at
  once.** A collapsed panel draws no body.
- **A press on the header expands a collapsed panel and collapses an expanded one, and the owner
  hears it.** The expanded state is a two-way binding. The panel writes it itself, and the owner may
  keep it in its own signal and change it from outside.
- **A disabled panel does not change on a press.** Its header is a disabled button, muted.
- **Without the chevron the header is pressed as before.** The chevron is hidden where there is
  nothing to open or the opening reads from the content.
- **The chevron of an expanded panel is turned half a revolution.** The turn is animated by the
  panel's duration.
- **The body opens and closes with motion of its height.** A browser without keyword height
  interpolation shows and removes the body at once. A reader asking for reduced motion gets none.
- **The header names its state and the body it controls to the assistive means.** It carries
  `aria-expanded`, and `aria-controls` while expanded. The body is a region labelled by the header.
- **The id of the header is taken from the owner when given, otherwise it is unique on the page.**
  An owner that presses a header by its own number gives that number.
- **The header and the body carry `qa-dataid`.** A check finds them without leaning on a class of the
  block.
- **The card look stands on the surface with a shadow; the plain look has no ground, shadow or
  spaces.** The plain look is for a panel standing as a row of a list that draws its rows itself.
- **The sizes of the header and the body are properties of the block that an owner overrides.** The
  owner reassigns them on the host by a rule of greater force. The panel's rules stay as they are.
- **The styles of the panel live in the cascade layer of the kit's components.**

## What is out of scope

- **A group where opening one panel closes the others.** Nobody asked for it.
- **A header with a description column.** The owner lays out its header itself.
- **A panel that rejects a press.** The panel writes its state before the owner hears of it. An owner
  deciding by rules of its own keeps the state in a linked signal.
- **Publishing a version of the package.** A separate manual run after the merge.

## Contract

Not applicable: the surface is the inputs of a component of the kit, and the subdomain serves no
procedures. The inputs are `expanded` (a two-way binding, `false`), `disabled` (`false`),
`hideToggle` (`false`), `appearance` (`'card'`), `headerId` and `ariaLabel` (`null`). The output is
`expandedChange`.

### Refusal codes

Not applicable.

## Data

Not applicable: the panel keeps only its expanded state.

## Screens and states

| State                   | What is visible                                     |
| ----------------------- | --------------------------------------------------- |
| collapsed               | the header and the chevron pointing down            |
| expanded                | the header, the chevron pointing up, the body under |
| without the chevron     | the header alone                                    |
| hover                   | the ground of the header                            |
| focus from the keyboard | the ring of the kit inside the header               |
| disabled                | a muted header and chevron                          |

The showcase gets the family's set: `Overview`, `Playground` and one story per axis. The axes are
`Appearance` (the card, the plain), `Opening` (collapsed, expanded, without the chevron) and
`Length` (a short header, a header that is cut, a long body). Then come `States`, `Presets` and
`Themes`. The motion is seen only in `Playground`.

## Cross-cutting requirements

### Locales

The kit adds no text: the header and the body arrive from the owner already in its language. The
dictionary of the kit gets nothing.

### SEO

Not applicable: a lazy body is not in the markup until expanded. An owner needing the text for a
search engine gives the body by the marked node.

### Mobile layout

Nothing of its own: the panel takes the width its container gives.

### Several objects

Several panels on one page keep their own state and their own ids. A panel nested in the body of
another declares its own sizes anew.

## Decisions

- **The family is named `rt-expansion-panel`.** The name of the Material component it replaces, so a
  first-kit reader finds it. Rejected: `rt-disclosure` — correct, but found by nobody coming from the
  first kit.
- **The kit gets a primitive of its own.** The owner chose it over two copies inside the side menu:
  «Завести rt-expansion-panel (Recommended)».
- **The motion is CSS, not the Angular animations package.** A starting style opens the body, and
  the leave binding of the template keeps it until the collapse ends. The kit takes no new
  dependency.
- **The chevron is the kit's `chevron-down`, turned by the styles.**

## Open questions

None.

## History of changes

- 30 September 2026 — the subdomain was written together with the component by task RT-2440.
