# A list of records with its own toolbar

**Status:** in force · **Revision:** 2026-09-15 · **Scenario prefix:** `SC-UKV`
**Depends on:** the table family, the pagination family, the toolbar, the input, the icon button,
the checkbox, the empty state and the select family of the kit
**Laws:** `frontend-application`, `verifiability`, `reuse-first`, `lists`
**Procedures:** none

## Why

A screen that shows records is never a bare table. Around it stand the same six things on every
such screen: a search field, a refresh button, a button that clears the filters, a button that
opens the column settings, a counter of what is selected and the pages at the bottom. The kit gives
the table and the pages apart; the six things around them each consumer assembles anew.

The first kit already assembled them once — a container of its own and a list component that wires
the container to the table by one input. That assembly is what the second kit lacks, and it is the
only part of the first kit's table folder with no answer here: the table, the sorting, the column
settings, the row actions and the pages the second kit already holds.

The family takes what the kit has and leaves the consumer one thing to answer: the records, and what
to do when a person asks for another page, another order, another filter or a refresh.

## Terminology

- **The toolbar** — the strip above the records: the search field on the right, the actions next to
  it, the selectors on the left.
- **The selectors** — what stands on the left of the toolbar: the select-all checkbox, the counter of
  what is selected, and whatever the consumer puts there.
- **The empty place** — what is drawn instead of the records when there are none at all, as opposed
  to when a filter left none.

### What it is called in the interface

The person behind the screen sees a list of records with a search above it. They see no container,
no toolbar and no dynamic list: they see the section they came to — orders, stands, people.

## Rules

- **The family assembles the kit's own families and draws nothing of its own.** The search is the
  kit's input, the actions are its icon buttons, the empty place is its empty state, the pages are
  its pagination, the records are its table. A family drawing a field of its own would repeat its
  states, its sizes and its dark theme, and they would diverge at the first edit.

- **A hidden action of the toolbar takes no place, and a switched-off one keeps it.** A screen that
  cannot be refreshed shows no refresh button. An action shown but switched off says to a person
  that the thing is possible here and unavailable now — a different statement, made deliberately.

- **The button that clears the filters is switched off while there is nothing to clear.** It stands
  in place because the screen has filters, and does nothing because none is set.

- **The search does not reach out on every keystroke.** The value settles first, and only then does
  the family say it changed. Otherwise a list of any size is re-requested letter by letter.

- **The empty place is told from an empty result under a filter, and they say different things.** No
  records at all is the state of the section; none under the filter is the state of the filter, and
  from there a person is shown the way back — the clearing of what they set.

- **The pages are drawn only where there is more than one.** A row of numbers under a list of three
  records is noise.

- **The consumer's own markup goes into the toolbar by two inputs, and neither of them is the
  search.** The left side takes the selectors, the right side the actions; the search field belongs
  to the family, and its place in the strip is not given away.

- **The records are projected, not passed by an input.** The table between them is the consumer's
  own: their columns, their cells, their row actions. The family stands around it and does not
  decide what is drawn inside.

## What is out of scope

The family fetches nothing. It says what a person asked for — another page, another order, another
filter, a refresh — and the consumer answers with records. Storing the column settings stays with
the table family, which already does it.

The filter in the header cell of the table is out of scope too: it belongs to the table family and
is work of its own.

## Contract

The family makes no calls to the server and declares no procedures.

### Refusal codes

Not applicable: the family makes no calls.

## Data

The family holds no data of its own. It passes through what the consumer gave: the records, the
page, the order, the filters and the flags of loading and fetching.

## Screens and states

Loading, fetching over drawn records, records with a toolbar, an empty section, an empty result
under a filter, a narrow screen where the selectors stand above the actions.

## Cross-cutting requirements

### Locales

Every label of the family — the search placeholder, the three action tooltips, the select-all label
and the counter — comes from the kit's dictionary, not from the markup.

### SEO

Not applicable: the kit's showcase is closed from indexing.

### Mobile layout

On a narrow screen the selectors stand above the actions rather than beside them, and the search
field takes the whole width. The threshold is the kit's own, from the breakpoints service.

### Several objects

Several lists on one page do not meet: each holds its own state, and the column settings are told
apart by the table's own identifier.

## Decisions

- **One family, not two.** The first kit keeps the container apart from the list that wires it to
  the table, and exports the container outward. Nothing in this tree calls it apart from the list,
  and two names for one assembly give a consumer two ways to do one thing.

- **The records are projected rather than passed.** A family taking records and columns as inputs
  would describe every cell, every row action and every custom template through itself, repeating
  the table's whole surface. Projection leaves the table to the consumer.

## Open questions

- **Q-DL-1** — whether the family should hold the selection of records itself. The first kit keeps it
  in the consumer and only shows the counter. Measured on the first consumer of the second kit.

## History of changes

- 2026-09-15 — the agreement is written before the code, task RT-2153.
