# The closing of a record of the cargo by the publisher of an edition

**Status:** in force · **Revision:** 2026-08-28 · **Scenario prefix:** `SC-MB`
**Depends on:** `agent-kit` (the command of the launch line the publisher calls the closing by)
**Laws:** `access`, `observability`, `verifiability`, `code-structure`
**Procedures:** none — the operation is declared by a controller of the intake

An agreement to the subdomain "the edit of a state by a tree": what a record of the cargo that arrived
from a foreign tree is closed by, when the edit by it entered an edition of the package.

## Why

The state of its own record is moved by the tree that sent it — that is true and stays. But a record
has a second reader: the publisher of the edition. The proposal of a neighbour enters the package at
their place, and the rule of the sorting out of the cargo says directly: "released" is put by whoever
publishes the edition, by the same movement as the publication.

Today they have nothing. They do not own the token of the neighbour, and moving a foreign record by
their own is not allowed: the intake takes the tree from the token and answers about a foreign record
the same way as about one that was not found. A hundred and twelve records of the neighbour therefore
stand in "new", and thirty-three of them have long lain in the package. The list at that lies to both
sides: the neighbour gets their proposal as not sorted out, the publisher a mountain of work that does
not exist.

## Terminology

- **The publisher of an edition** — a person who entered the admin application of the intake: they get
  the records of all the trees and publish the editions of the package. They differ from a tree by the
  way of introducing themselves — an entry, not a token.
- **The closing of a record** — the move of a foreign record into "fixed and not released" or into
  "released" with the way of the fix and the version of the release.
- **The own tree of a record** — the tree that sent the record. Its right to move its own state is not
  cancelled by the closing.
- **The sign of a record in the intake** — what the record is named by at the intake. Not to be confused
  with the key of the mark: by that one the record is moved by its own tree, by this one it is closed by
  the publisher.

### What it is called in the interface

| In the agreement                   | In the launch line                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| the closing of a record            | `npm run cargo:close -- --state fixed --proposal …`                            |
| the entry of the publisher         | the pair of an account of the service, the same as at the reading of the cargo |
| the sign of a record in the intake | the line `in the intake <sign>` in the output of the reading of the cargo      |

## Rules

- **The closing of a record is closed by the entry of a person, not by the token of a tree.** The token
  of a tree answers for its own, and opening a foreign record by it would mean bringing back exactly
  what the two ways of introducing oneself are set apart for: a leaked token would move the states of all
  the trees at once.
- **The publisher closes a record of any tree, including their own.** There is nothing and no reason to
  separate them: the movement is one and the same, and the sign of the tree at a record is visible
  anyway.
- **The closing goes only forward and only over the two last steps.** "Fixed and not released" and
  "released" are the states put by whoever fixed and published; "in progress" stays with the tree,
  because it means work taken by it.
- **The way of the fix is mandatory at the transition into "fixed and not released", the version at the
  transition into "released".** The rule of the sorting out of the cargo demands both of the sender, and
  the publisher has fewer reasons to stay silent: it is exactly they who know what it was closed by and
  in which edition.
- **The closing names who made it.** A record keeps the sign of the tree that sent it, and that is not
  whoever closed it: a neighbour who gets their record released must understand that it was moved by the
  publisher, not that they themselves forgot.
- **The right of a tree of its own is not cancelled by the closing.** The sender still moves their record
  by the token; the closing is a second way, not a replacement of the first.
- **A row of the closing names the record by the sign from the reading, not by the key of the sender.**
  The name of the file and the sign of the text are unique at their own tree, not in the intake: at two
  trees they coincide, and a named key would find two records instead of one. The sign arrives by the
  same reading the publisher gets the cargo by, and it is printed next to the record.
- **The closing arrives as a bundle.** The publisher closes at once everything that entered the edition:
  a call per record would cost as much as the sorting out itself.
- **A row of the bundle is refused on its own.** The reasons are the same as at the edit by a tree: there
  is no record, the transition is not allowed, the text of the fix or the version is missing.
- **The answer names the number of the moved ones, the number of the ones that already stood there and
  the refused rows.** It is read the same way as the answer of the edit by a tree: zero moved is a
  refusal, not a success.

## What is out of scope

- **The edit of the text of a foreign record.** The publisher closes the state, they do not rewrite the
  proposal: the text belongs to the sender.
- **Bringing a foreign record back.** From "released" there is no road for anybody, and "in progress" is
  put only by the tree — otherwise the publisher would cancel foreign work.
- **The closing from the admin application by a press.** The screen of the intake reads; the movement of
  the states goes by a command, as at a tree.

## Contract

The operation is declared by a controller of the intake next to the edit of a state by a tree and is
closed by the entry of a person.

### Refusal codes

Not applicable: the intake answers with a code of the answer of HTTP, not with named codes of the
domain. Where the closing is obliged to refuse instead of staying silent:

| What happened                                        | Code  | What it says                                           |
| ---------------------------------------------------- | ----- | ------------------------------------------------------ |
| there is no entry or it is not fit                   | `401` | an entry is needed, and a token of a tree does not fit |
| the form of the bundle did not match                 | `400` | the reason and the place of the row                    |
| there is no record with such a key at all            | `200` | the row is refused: there is no record                 |
| the transition is not allowed by the order           | `200` | the row is refused: the transition is forbidden        |
| there is no way of the fix or version of the release | `200` | the row is refused: what is missing                    |

## Data

There is no storage of its own. The same fields of a record are edited as at the edit by a tree: the
state, the way of the fix, the version of the release. One is added — the sign that the record was
closed by the publisher, not by its tree: a column at both kinds of records, empty by default.

## Screens and states

The screen of the list shows the sign of the closing by a publisher in the same place it shows the
state: otherwise the sender reads a released record as their own mark.

## Cross-cutting requirements

### Locales

The answer of the operation is single-language, as at the neighbouring operations of the intake.

### SEO

Not applicable.

### Mobile layout

Not applicable: the operation has no screen.

### Several objects

The records of all the trees are available to the publisher equally: they are the owner of the intake,
not one of the trees.

### Shared

- The closing writes a row of the journal: who closed, how many records, of which tree.
- The limit of the frequency is the same as at the neighbouring operations under the entry.

## Decisions

- **A second way, not a replacement of the first.** The sender stays the master of their record; the
  publisher gets the right to exactly the two last steps and only forward.
- **The sign of whoever closed is kept, it is not derived.** There is nothing to derive it from the
  history by: the field of the state is one, and who moved it is not visible in any way after the edit.

## Open questions

- Whether the sender should be told about the closing of their record otherwise than by the look in the
  list. There is no answer yet: the intake has no mail at all, and an invented channel would create a
  second truth.

## History of changes

- 2026-08-28 — the agreement was created and merged into the domain together with the operation of the
  closing, the command of the launch line and the sign of whoever closed in the reading.
