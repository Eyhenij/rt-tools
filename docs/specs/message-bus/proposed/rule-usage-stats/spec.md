# Usage of the rules over a month — the intake and the panel of a record

**Status:** proposed · **Revision:** 2026-09-14 · **Scenario prefix:** `SC-MB`
**Depends on:** `agent-kit` (the month block is counted and sent by the tree)
**Laws:** `verifiability`, `entity-models`, `lists`, `reuse-first`, `frontend-application`
**Procedures:** none — the operations are declared by the controllers of the intake

The product agreement of the receiving side. It merges into two subdomains: what the intake does
with the block into "The intake of the cargo", the table into "The reading of what was taken in".
The sending side — how the tree counts the block and what leaves — is the agreement of the same
name in the domain of the package, `docs/specs/agent-kit/proposed/rule-usage-stats/`.

## Why

The owner of the intake wants to see, per consumer tree, which skills and rules the sessions load
and how many times. Today the record of a month shows its digest as a block of code in the panel of
details: the counts are there, but over the last three days only, and reading a list of pairs out of
a code block is not reading a table.

The digest now carries a month block — the loads from the first day of the month, per resource,
with the sessions and the refusals of the rules gate. This agreement names what the intake does with
it (nothing new) and how the section of the digests shows it: a table in the panel of the record,
under the same right, with no new section, operation or storage.

## Terminology

The vocabulary of the domain whole is in the spec next to it. Here only what the block brings:

| Term                   | What it is                                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| The month block        | The part of the digest counted by the tree from the first day of the calendar month to the day of the run                    |
| A usage line           | One row of the block: a resource, its kind, how many loads, how many sessions loaded it, how many refusals of the rules gate |
| The rules gate         | The guard of the tree that refuses an edit until the matching rule is loaded; not the gate before a push                     |
| The kind of a resource | One of four: a rule of the package, a pattern of the package, another skill of the package, the tree's own skills            |
| The line of the own    | The one row all the tree's own skills come as: the counts and how many distinct names stand behind them, no names            |
| The table of usage     | The section of the panel of a record drawn from the block: a row per usage line                                              |
| The month of the block | The month the tree counted the block for; it is not obliged to equal the month of the record                                 |

### What it is called in the interface

| In the agreement        | On the screen                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| the table of usage      | the section "Использование правил" in the panel of a record of the section "Сводки деревьев"   |
| the columns of a row    | "Ресурс", "Род", "Загрузок", the word of the column of sessions of the list, "Отказов"         |
| the kind of a resource  | "правило", "паттерн", "скил пакета", "свои скилы дерева"                                       |
| the line of the own     | the row "свои скилы дерева" with the number of names in brackets after it                      |
| the day counted through | the line under the heading of the section: from the first day to the named one, universal time |

## Rules

**The intake.**

- **A digest without the month block is taken in as before.** A block is not a mandatory field of
  the digest: a tree on the former edition of the package sends none, and a refusal would lose its
  run for the sake of a table it cannot fill anyway.
- **The intake does not take the block apart.** The rule about the content of the digest holds for
  it whole: the block lands in the record as it arrived, and it is the reading that judges it. An
  intake that knew the lines by heart would refuse at every edit of the package.
- **The block replaces the former one together with the digest.** Inside a month the block only
  grows, so the last run holds the largest one; a block kept apart from the digest would be a
  second record of a month with its own race.

**The panel of a record.**

- **The table of usage is drawn from the block of the record itself, not by a second request.**
  The panel already reads the record whole; a second operation would need a second right and a
  second refusal for the same row of the storage.
- **A record without the block draws no table.** The digest of the former edition of the package
  has no lines to draw, and a table of zero rows would read as "nothing was loaded"; the digest as a
  block of code stays visible under it as before, and the line about there being no digest stays.
- **A block without lines draws the table with one line saying that nothing was loaded over the
  month.** That is what the tree said, and it differs from a record without a block: there the
  count is unknown, here it is zero.
- **A row of the table shows the resource, its kind, the loads, the sessions and the refusals, and
  the rows go in descending order of loads.** At equal loads by name. The order comes with the
  block and is not recounted on the screen: a table sorted by the screen would answer otherwise
  than the print of the digest at the tree.
- **The line of the own stands last, whatever its loads.** It is not one resource but the tree's
  whole set, and among the rows of resources it would read as the most loaded rule of all.
- **The kind is shown by a word of the domain, not by the word of the cargo.** "Правило",
  "паттерн", "скил пакета", "свои скилы дерева": the person behind the screen has read no rule of
  the layer, and `own` in a cell is an internal word shown outward.
- **The month of the block is shown at the section when it differs from the month of the
  record.** A run at the minute of the boundary lands the block of the old month into the record
  of the new one; without the month on the screen the numbers read as the new month's.
- **The day the block was counted through stands under the heading of the section.** Three hundred
  loads by the third and by the thirtieth are different news, and without the day the table
  answers "how many" and hides "over how long".
- **The table is the table of the kit, and the section is the section of the kit.** Drawn by
  markup of its own, it would diverge from the neighbouring panels in look and lose the cards of
  the narrow screen.
- **The table stands under the same right as the record.** Whoever reads the digests reads the
  table: it is the same record, shown by fields instead of a code block.
- **The numbers of the table are checked against the print of the digest at the tree.** The
  acceptance of the work is a tree sending its block and the table showing the same lines with the
  same counts; a table checked by reading its own code is not checked.

## What is out of scope

- **A new section of the admin application and a right of its own.** The section of the digests
  has the list, the filter by tree, the column of the month and the right; the table is added to its
  panel.
- **A list of sessions per resource.** A hash of a session is not readable by a person and leads to
  no decision.
- **Charts, and a digest over several trees.** The table shows one tree over one month, in the
  panel of its record. Bringing trees together is appointed when there are three trees — the line
  in "What is out of scope" of the domain spec is reworded at the merge to say that the usage of
  one tree over one month is in scope.
- **A storage of raw observation lines, its retention and its validation.** The block is a field of
  the digest and lies in the record of a month.
- **A filter or an order over the table.** The block has a dozen rows; the order comes with it.
- **The column of sessions of the list of the digests.** It shows what it showed: the sessions of
  the window of the run. Whether it should show the sessions of the month is an open question.

## Contract

No new operation. The block arrives by `POST /api/intake/summary` as a field of the digest, and
leaves by `GET /api/summaries/:id` inside the field of the digest, as it arrived. The page of the
list, `GET /api/summaries`, does not carry the block: the page does not carry the digest whole.

The form of the block is declared once, on the sending side, and the intake reads it from the same
declaration — the rule about the form of the cargo in the subdomain of the intake.

### Refusal codes

Not applicable: the block adds no refusal. A digest without it passes the check of the form as
before; a digest with a block of any content passes too — the intake does not judge the content of
the digest.

## Data

No entity of its own. The block lies inside the field of the digest of the record of a month, and
the record is one per pair "tree — month" as before. No migration.

## Screens and states

| Screen                          | States                                                                                                                                         |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| The table of usage in the panel | reading: the rows dimmed under the sign of reading · rows · one line "nothing was loaded over the month" · no section: the record has no block |
| The heading of the section      | the name alone · the name with the month of the block, when it differs from the month of the record · the day counted through under it         |
| The line of the own             | absent: the tree loaded no own skill · last row with the number of names                                                                       |
| The digest as a block of code   | as before, under the table                                                                                                                     |

## Cross-cutting requirements

### Locales

The language is one — Russian; the labels of the section, the columns and the kinds lie in the
dictionary of the application, not in the markup, as the labels of the panel do today.

### SEO

Not applicable: the screen stands behind the entry.

### Mobile layout

The table of the kit shows a row as a card on a narrow screen; the section of the panel takes the
whole width of the panel, as the sections next to it.

### Several objects

The table shows the block of one record — one tree, one month. The filter by tree of the list
narrows what is shown, not the access: an account belongs to the service, as before.

## Decisions

- **A table in the panel of the record instead of a new section "Использование".** The section of
  the digests already has the list, the filter by tree, the column of the month and the right, wired
  in six files; a new section would repeat all of it for a table of a dozen rows. Lost: a menu
  entry of its own. Rejected: a section with the right `usage:read`.
- **The block lies in the record of a month, not in a table of its own.** No migration, no
  retention, no validation of content, no weight to watch; the replacement of the digest by the last
  run keeps the largest block. Rejected: a table of raw observation lines replaced per day and kept
  for a year.
- **The order of the rows comes with the block.** The screen shows what the tree printed, and the
  acceptance compares the two by eye. Rejected: sorting on the screen.

## Open questions

- `Q-31` — whether the column of sessions of the list of the digests should show the sessions of
  the month from the block instead of the sessions of the window. The work goes with the column as
  it is: the list is not touched by this work.
- `Q-32` — what the stand of the end-to-end suite seeds as a block: the seed sends `loads: 512`
  today and passes, and the table needs lines. The work goes with a seed of a block of three lines
  and a line of the own, in the shape the sending side declares.
- `Q-33` — whether the table needs a sign of a check per row for the end-to-end suite, or the sign
  at the section and at the table is enough. The work goes with the sign at the section, the table
  and every row, as the rows of the properties of the panel have today.

## History of changes

- 2026-09-14 — created from the grill of the owner's request about the statistics of rule usage in
  the sessions of consumer trees. The raw-line cargo, the observation table, the retention, the
  section "Использование" with its right and the panel of sessions of the grill were replaced by a
  month block inside the digest and a table in the panel of the record of a month.
