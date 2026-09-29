# The accordion

**Status:** in force · **Revision:** 29 September 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the icon of the kit — the arrow of an item is its `chevron-down`; the design of the
kit — the line, the type and the spaces come from its appointments
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written before the code by task RT-2395 and merged with the
scenario numbers it had as an agreement.

## Why

The second kit has nothing for a list of questions with answers that open on a press. An
application that needs a block of frequent questions writes its own: a heading drawn as a button, an
arrow, the opening, the links for the assistive means. Its look drifts from the rest of the kit, and
nothing checks it. `rt-collapsible-text` opens one long text by a "more" button and holds no list
of headed items; `rt-section-nav` leads between sections of a page and opens nothing.

## Terminology

| Term       | What it is                                                              |
| ---------- | ----------------------------------------------------------------------- |
| the item   | one heading with its text under it                                      |
| the toggle | the heading of an item drawn as a button across the whole width         |
| the panel  | the text of an item; visible only while the item is open                |
| open       | the item whose panel is visible                                         |
| the entry  | the first drawing of the accordion, or a drawing after new items arrive |

### What it is called in the interface

| In the agreement | On the screen                                        |
| ---------------- | ---------------------------------------------------- |
| the item         | a question with a line under it                      |
| the toggle       | the question itself, with an arrow at the right edge |
| the panel        | the answer under the question                        |
| open             | the answer is shown, the arrow points up             |

## Rules

- **The items arrive by a required input, each a heading and a text already in the caller's
  language.** The accordion knows nothing of what it shows and adds no text of its own.
- **A press on the toggle opens a closed item and closes an open one, and the other items stay as
  they were.** A reader compares two answers, and closing the first on opening the second would take
  away what they were reading.
- **On the entry one item is open, the first by default.** The input names it by its position;
  `null`, a negative position and a position past the list leave every item closed.
- **New items start the opening anew from the entry position.** The positions of the former list
  mean nothing in the new one.
- **The toggle is a button across the whole width: the heading on the left, the arrow on the
  right.** The whole line takes the press, not the arrow alone.
- **The arrow of an open item is turned half a revolution.** The turn is animated by the kit's short
  duration.
- **The toggle names the state of its item and the panel it controls to the assistive means.** It
  carries `aria-expanded` and `aria-controls`; the panel is a region labelled by its toggle.
- **The toggle stands inside a heading of the third level.** A reader moving by headings finds
  every question of the list.
- **The panel of a closed item is hidden from everyone, not only from the eye.** It is neither read
  aloud nor found by the page search.
- **The ids linking a toggle to its panel are unique on the page.** Two accordions on one page do
  not point at each other's panels.
- **Every toggle and every panel carries `qa-dataid`.** A check finds them without leaning on a
  class of the block.
- **Items are divided by a thin line of the subtle border colour, the text of the panel is muted.**
  The heading is drawn in the primary text colour and the semibold weight.
- **The styles of the accordion live in the cascade layer of the kit's components.**

## What is out of scope

- **A mode where opening one item closes the others.** Nobody asked for it, and an input without a
  consumer would be held for nothing.
- **Markup inside an item.** The heading and the text are strings; a projected answer with links or
  lists is not promised.
- **An output reporting the opening.** The accordion keeps its state itself, and nobody needs to
  hear about it.
- **Publishing a version of the package.** A separate manual run after the merge.

## Contract

Not applicable: the surface is the inputs of a component of the kit, the subdomain serves no
procedures. The inputs are `items` (required) and `openIndex` (`0` by default, `null` allowed). There
are no outputs.

### Refusal codes

Not applicable.

## Data

Not applicable: the accordion keeps only the set of open positions.

## Screens and states

| State                   | What is visible                                             |
| ----------------------- | ----------------------------------------------------------- |
| closed item             | the heading and the arrow pointing down, a line under it    |
| open item               | the heading, the arrow pointing up, the muted text under it |
| several open            | each open item shows its text; nothing else closes          |
| focus from the keyboard | the ring of the kit around the toggle                       |
| empty list              | nothing is drawn                                            |

The showcase gets the family's set: `Overview`, `Playground`, one story per axis — `Opening` (the
first open, none open, several open) and `Length` (a short heading, a heading that wraps, a long
text) — then `Themes` and `Presets`.

## Cross-cutting requirements

### Locales

The kit adds no text: the headings and the texts arrive from the caller already in its language.
The dictionary of the kit gets nothing.

### SEO

The panel of a closed item stays in the markup: a page drawn on the server gives every answer to a
search engine, and the reader opens it by a press.

### Mobile layout

Nothing of its own: the accordion takes the width its container gives, and a long heading wraps.

### Several objects

Several accordions on one page keep their own opening and their own ids.

## Decisions

- **The family is named `rt-accordion`.** The name of the pattern in every component set; rejected:
  `rt-faq` — it names one use of the accordion, not the accordion.
- **Items open independently.** Rejected: only one open at a time — see the rule on the press.
- **The arrow is the kit's `chevron-down`, turned by the styles.** The set already holds the icon;
  the kit starts no icon of its own.
- **The decision of what is open lives in pure functions next to the component.** It is checked by
  a call, and the component stays a thin wrapper around it.

## Open questions

None.

## History of changes

- 29 September 2026 — the agreement was written by the grilling of the owner's request.
- 29 September 2026 — the agreement merged into the spec of the second kit as a subdomain of its own.
