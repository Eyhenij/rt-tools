# A record closed by the publisher stays closed on a repeated arrival

**Status:** proposed · **Revision:** 2026-09-15 · **Scenario prefix:** `SC-MB`
**Depends on:** none
**Laws:** `verifiability`, `entity-models`
**Procedures:** none — the operation of the intake is declared next door, in the subdomain "intake"

An agreement about the product written before the code. It merges into the spec of the subdomain
"intake" by one of the last commits of the branch, with the same scenario numbers.

## Why

The record of the cargo carries two fields that speak of its closing: the state, which the tree
and the publisher move, and the sign "closed by the publisher", which the closing sets and nobody
takes off. An arrival of an analysis with another text brings the record back into "new" and knows
nothing of the sign. The two rules met on sixty-two records of one tree: the publisher closed them,
the tree sent the files again with the marks of the closing written into them, and the list showed
"new (closed by the publisher)" — a state that is on no map. The sender read it as unsorted cargo,
the publisher as their own closing undone.

## Terminology

| Term                    | What it is                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------- |
| A closed record         | A record with the sign "closed by the publisher": the fix entered an edition       |
| A repeated arrival      | An analysis with the same file name arriving on top of the one that lies           |
| A state outside the map | A pair "the sign is set, the state is new": neither rule of the intake produces it |

### What it is called in the interface

The list of analyses prints the state and, next to it in brackets, the sign of the publisher's
closing: "Готово (закрыто издателем)". After this agreement the bracket stands only next to
"Готово" and "Выпущено".

## Rules

- **A repeated arrival does not bring a record closed by the publisher back into "new".** The text
  is updated, the state stays: the fix lies in an edition of the package, and another text of the
  analysis does not undo the edition — the same as the closing itself goes only forward.
- **A record found with the sign set and the state "new" is put back into the closed state by a
  migration.** With a release version — "released", without one — "fixed": both values the closing
  wrote, and the state is restored from them, not guessed.

## What is out of scope

- **A record closed by its own tree.** An arrival with another text brings it back into "new" as
  before: the spec of the intake says it is sorted out anew, and the owner asked nothing about it.
- **Taking the sign off.** It stays one-way; the state now cannot diverge from it.

## Contract

Not applicable: the operation of the intake and its body do not change — only what an arrival
writes over a record that already lies.

### Refusal codes

Not applicable.

## Data

Two fields of the record `postmortem` and `proposal`, both already in the storage: `state` and
`closedByPublisher`. The migration edits rows, not the schema.

## Screens and states

| State                       | How it shows                                                      |
| --------------------------- | ----------------------------------------------------------------- |
| closed record, text changed | the list shows the new text and the former state with the bracket |
| a pair outside the map      | gone after the migration; nothing creates it anew                 |

## Cross-cutting requirements

### Locales

Not applicable.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable: the arrival judges each record by its own text and its own sign.

- **Authorization:** unchanged — the arrival goes by the tree token as before.
- **Errors:** none new — a closed record's arrival answers as an ordinary one.
- **Audit:** none — the arrival writes no journal line now, and this agreement adds none.
- **Concurrency:** the arrival reads the sign together with the text before the transaction; two
  runs of one tree between the read and the write cost one state, as the spec of the intake says.

## Decisions

- **The state is kept, not the sign taken off.** Taking the sign off would leave the publisher no
  trace of their closing and would put the record on the sender's list a second time. Rejected: a
  reset with the sign taken off.
- **The rows are repaired by a migration, not by a repeated closing.** The fix text and the version
  already lie at the records; a repeated closing would resend them sixty-two times.

## Open questions

None.

## History of changes

- 2026-09-15 — the agreement is written after sixty-two records of one tree showed a state outside
  the map.
