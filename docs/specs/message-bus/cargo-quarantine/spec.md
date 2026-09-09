# The quarantine of a disputable record

**Status:** in force · **Revision:** 2026-09-09 · **Scenario prefix:** `SC-MB`
**Depends on:** `cargo-state` (the edit of a state by a tree)
**Laws:** `access`, `observability`, `verifiability`
**Procedures:** none — the operations are declared by the controllers of the intake

A subdomain of the domain "the intake of the cargo": where a proposal goes that was compared with
the spec and found disputable. What is shared — the terminology of the domain, the cross-cutting
requirements and the decisions — lies in the spec of the domain next to it.

## Why

A proposal found disputable had nowhere to go. "New" leaves it among what is not sorted out
forever, and the next sorting out takes it apart anew; "in work" lies — no work by it is going. The
set of states had no refusal state at all, and the rule of sorting out named that as an open
question outright.

The subdomain names the state such a record goes into, what the move carries and how the record
comes back.

## Terminology

- **The quarantine** — the state of a record of the cargo: it was taken apart, and the outcome is
  that it does not become work.
- **The reason** — the text travelling with the move into the quarantine: what makes the record
  disputable.
- **The return** — the move from the quarantine back into "new": the record becomes work again by
  the word of a person.

### What it is called in the interface

The person sees the state in the list of records of the admin panel — as a word of their own
language in the state column, and as a value of the state filter.

## Rules

- **The quarantine is a state of a record, not a directory on a disk.** A directory lives on one
  machine and is invisible in the admin panel: a list of the disputable that one session sees is no
  list.
- **A record goes into the quarantine from "new" alone.** From "in work" it means the work was
  taken and dropped, and for that there already is the return into "new"; from "fixed" and
  "released" it would rewrite the past.
- **From the quarantine a record goes back into "new" alone.** Forward would mean fixing what was
  decided not to fix. The return is the only way out, and by it the record becomes work again.
- **The move into the quarantine carries the reason, and without it the row is refused.** A state
  with no answer to "what makes it disputable" is taken apart anew every time — exactly what the
  quarantine is started against.
- **The reason is accepted only with a row moving into the quarantine.** Arriving with another
  move, it is refused: a reason lying at a record that is not in the quarantine reads as one of it.
- **The reason travels by the same road as the text of the fix — a field of a row of the edit.** An
  operation of its own would judge the move twice and diverge from the first judgement in silence.
- **The publisher of an edition does not put the quarantine.** It speaks of work a tree conducts,
  and the publisher sees the record once — when the edit has entered an edition.
- **The list of the quarantine is read by the same read the cargo is taken by, filtered by the
  state.** A read of its own would answer the same question by a second road, and the two would
  diverge silently.

## States

| The move                      | What happens                                              |
| ----------------------------- | --------------------------------------------------------- |
| new → quarantine, with reason | the record is moved, the reason lies at it                |
| new → quarantine, no reason   | the row is refused, the record stays new                  |
| quarantine → new              | the record is moved, the reason stays lying at it         |
| quarantine → fixed, released  | the row is refused: forward from the quarantine is closed |
| in work → quarantine          | the row is refused: the return into "new" stands for that |

## What is out of scope

- The judgement of which proposal is disputable: it is made by the sorting out against the spec,
  and here only the place for the outcome is named.
- A screen of the quarantine of its own: the record is seen in the common list by the filter on the
  state.
- Taking the record out of the quarantine by itself: it is returned by the word of a person.

## Contract

The surface is the same operation of the edit of a state by a tree: the row carries the key, the
state and the reason. The answer is the same — how many were moved, how many already stood there
and which rows were refused.

### Refusal codes

| What happened                                        | Code        | What it says                               |
| ---------------------------------------------------- | ----------- | ------------------------------------------ |
| a move into the quarantine without a reason          | row refused | the reason of the refusal by name          |
| a reason with a move that is not into the quarantine | row refused | the reason of the refusal by name          |
| a move forward out of the quarantine                 | row refused | the transition is not allowed by the order |

## Data

The state is a value of the enumeration of the storage, the reason a column of the record next to
the text of the fix. Both kinds of records of the cargo carry them.

## Screens and states

| The state of the screen                   | What the person sees                                |
| ----------------------------------------- | --------------------------------------------------- |
| the list without a filter                 | the records of the quarantine among the rest        |
| the filter on the state of the quarantine | only them, with the reason at each                  |
| a record of the quarantine in the list    | the word of the state in the language of the person |

## Cross-cutting requirements

### Locales

The word of the state is taken from the labels of the admin panel, on a par with the other four.

### SEO

Not applicable: the admin panel is closed by a sign-in.

### Mobile layout

Not applicable: the requirement of the domain holds, the subdomain adds nothing of its own.

### Several objects

The state belongs to a record of a tree, and every tree sees only its own records: the quarantine
of one tree does not reach a neighbour.

## Decisions

- **The quarantine is a fifth state, not a sign next to the four.** A sign would have to be read by
  every place that judges a move, and the order of the moves is already declared once.
- **The return goes into "new" and not into "in work".** A record returned straight into work would
  skip the very comparison with the spec it was quarantined by.
- **The reason is a column of its own, not the text of the fix.** They answer different questions,
  and one column would give a record whose fix says why it was not fixed.

## Open questions

- `Q-CQ-1` — the word of a person that returns a record from the quarantine leaves no trace: the
  return is an ordinary move, and who asked for it is visible only in the journal of the intake.

## History of changes

- 2026-09-09 — the subdomain was created: the quarantine as a state of a record, the reason at the
  move and the return into "new".
