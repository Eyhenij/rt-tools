# The filter in the header cell of the table

**Status:** in force · **Revision:** 2026-09-18 · **Scenario prefix:** `SC-UKV`
**Depends on:** the table family of the kit and its ready parts — the field, the number field, the
select, the date picker, the menu and the icon button
**Laws:** `frontend-application`, `verifiability`, `reuse-first`, `lists`
**Procedures:** none

## Why

A list narrows by what stands in its columns. A search field above the table asks one question of
every column at once: a person looking for the rows of one status, or for everything created before
a date, has to read the whole page instead. The narrowing belongs where the column is named — in the
header cell, next to the column's own name.

The table family of the second kit has sorting in the header and no filter at all. The first kit has
one, and it is the last part of its table directory that still stands on Material. It is not carried
over as it is: every part it needs — a field, a number field, a select, a date picker, a menu —
already exists in the second kit.

## Terminology

- **The filter of a column** — the pair "a comparison operator and a value" by which one column
  narrows the list.
- **The kind of the filter** — which of the four the column asks for: text, number, a choice from a
  list, or a date. The kind decides which part of the kit is called.
- **The comparison operator** — how the value is matched: equals, does not equal, starts with, ends
  with, contains, greater than, less than.
- **The set of conditions** — the filters of every column at once. That is what goes outward; one
  column's filter never travels alone.

### What it is called in the interface

The person behind the screen sees no set of conditions and no operator type. They press the sign
next to a column's name, choose how to match and type what to match, and the list narrows to the
rows where that column answers.

## Rules

- **The filter stands in the header cell, next to the name of the column and its sorting.** A
  narrowing that lives away from the column it narrows leaves no way to see which column is
  narrowed: a person reads a short list and does not learn why it is short.
- **The kind of the filter is declared by the column, not guessed from the value.** A guess by the
  value reads an empty column as text and a number written as a string as text as well, and the
  column then gets a match it never promised.
- **Each kind calls the ready part of the kit for it.** Text — the field, number — the number field,
  a choice from a list — the select, a date — the date picker. Nothing here draws a control of its
  own: a second field written next to the kit's answers differently to a press, to a locale and to
  the narrow screen.
- **The comparison operator is chosen from the list the column allows, and the column names the one
  it starts with.** Allowing every operator on every kind offers "starts with" for a date; allowing
  none leaves the person with equality alone, and a list of names is then unsearchable.
- **An empty value takes the column out of the set of conditions and does not travel as an empty
  condition.** A condition with nothing in it asks the consumer to answer "everything matches", and
  a consumer who reads it literally returns no rows at all.
- **A typed value is reported when the field is left or Enter is pressed, and a chosen one at once.**
  A consumer asks the server by the set of conditions, and a set sent on every keystroke asks it once
  per letter: the answers then come back out of order, and the list shows the reply to a value the
  person has already changed. A choice from a list and a date have no half-typed state at all, so
  waiting for them to be left would only delay the answer.
- **An empty field says what is expected of it.** A field with neither a label nor a hint next to it
  gives the reader nothing to go by: they see a frame and guess whether it takes a word, a number or
  a date. The hint comes from the kit's dictionary, the same way every other word of the family does.
- **Choosing the value that is already chosen reports nothing outward.** The same set of conditions
  sent a second time makes the consumer ask for the same rows again, and on a slow answer the list
  blinks where nobody did anything.
- **Changing the operator while no value is set reports nothing outward.** Until there is something
  to match, the way of matching narrows nothing, and the set of conditions has not changed.
- **A date is kept as a string and compared as a string.** A date object never equals a string, so
  with the two forms mixed the same date chosen twice counts as a new value every time — and the
  article above then never holds.
- **The filter reports outward and narrows no rows itself.** The rows belong to whoever holds the
  list; a header cell that drops them keeps a state that is not its own.
- **The whole set of conditions goes outward, not the one condition that changed.** The consumer
  asks the server by the set; given one condition, they would have to keep a second copy of the set
  and the two would part silently.
- **Clearing is shown only where there is something to clear.** A clearing control that is always
  there reads as a set filter on a column that narrows nothing.
- **The table draws the row of filters itself, from the column configuration.** A consumer who
  writes the header markup of every column by hand repeats in each table what the column
  configuration already says, and the two drift apart silently: a column gains a filter in the
  configuration and does not gain a cell. The first kit draws that row itself, and a consumer
  moving over from it expects one field in the column configuration rather than markup of their own.
- **The filter row is a row of the table, not a part of the header cell.** The header cell of a
  column is declared by the consumer through the column markup, and there is nowhere for the table
  to put a cell of its own inside it. So the row stands under the header, and a column that
  declared no filter keeps an empty cell of its own place in it — otherwise the cells shift by one
  and stand under foreign columns.
- **The row of filters is drawn only where it is asked for.** A table that has filters in its
  column configuration does not become a table with a row of fields above the rows: the second row
  of the header costs the height of the screen, and whether to pay it is decided by the consumer.
- **The table reports the whole set of conditions and narrows no rows.** The same boundary the
  header cell already draws: the table says what was asked for, the rows are fetched by whoever
  holds the list.
- **In the card view the filter row is not drawn.** On a narrow showing the table puts cards in
  place of its rows, and there are no columns left for a row of cells to stand over: a strip of
  fields above a list of cards reads as a piece of the other markup. How a person narrows the list
  on a narrow screen is a surface of its own, and it stands in the open questions rather than
  arriving as an accident of the wide markup.

- **The styles of the filter live in the cascade layer of the kit's components.** A consumer keeps
  the last word over them, and a rule that rode past the layer takes that away from them silently.

## What is out of scope

- **Narrowing the rows.** The family says what was asked for; the rows are fetched by whoever holds
  the list. That is the same boundary the family of the list with its own toolbar already draws.
- **Remembering the filters between visits.** Column settings are remembered by the table family,
  which already does it, and the filters go the same way when they are asked for — that is work of
  its own.
- **Several values in one column.** The first kit carries a sign for it in the column settings and
  no markup behind it. Promising it here without the markup would be an intention, not a rule.
- **A filter over a column the table does not show.** What is hidden narrows invisibly, and the
  person reads a short list with no sign of why.

## Contract

The header cell takes the column's filter settings and the current set of conditions as inputs, and
reports one thing outward: the set of conditions after the change. Nothing else leaves it.

### Refusal codes

Not applicable: the family is a component of the kit and throws no refusals.

## Data

A condition is three things: which column it is about, how the value is matched, and the value
itself. The set of conditions is a list of those. The column's filter settings are the kind, the
operators allowed, the operator to start with and — for a choice from a list — the options.

## Screens and states

| State                        | What is seen                                                     |
| ---------------------------- | ---------------------------------------------------------------- |
| no filter on the column      | the sign next to the column name, nothing chosen, no clearing    |
| the operator is being chosen | the menu of the operators the column allows                      |
| a value is set               | the value in the part of the kit for that kind, and the clearing |
| the filter is cleared        | the state of "no filter" again, and the set has lost that column |

## Cross-cutting requirements

### Locales

The names of the operators and the label of the clearing come from the dictionary of the kit, not
glued in the template: the first kit glued them, and a consumer in another locale had no way to
reach them.

### SEO

Not applicable: the kit draws no public pages.

### Mobile layout

The filter opens in a layer above the page rather than widening the header cell: a column on a
narrow screen is narrower than any field. The parts of the kit that are called decide their own
size by the pointer, and this family adds nothing of its own to that.

### Several objects

Not applicable: the family holds no data of a workspace.

## Decisions

- **The kind of the filter is a closed set of four.** The first kit has exactly these four, and the
  application on it has asked for no fifth in the time the kit has lived.
- **The operator list belongs to the column rather than to the kind.** Two text columns want
  different lists — a name is searched by "contains", a code by "equals" — and a list derived from
  the kind alone cannot tell them apart.

## Open questions

- Whether the filters are remembered between visits the same way the column settings already are.
  Asked of the owner when a consumer asks for it; until then the answer is "they are not".
- How the list is narrowed on a narrow screen, where the table draws cards and the filter row is
  not drawn at all. Asked of the owner when a consumer asks for it; until then the answer is "the
  filter row is for the wide showing".

## History of changes

- 2026-09-18 — the subdomain is started by RT-2226. The filter in the header cell is named as work
  of its own by the domain of the list with its own toolbar, and the port of the table left it
  deliberately untouched.
