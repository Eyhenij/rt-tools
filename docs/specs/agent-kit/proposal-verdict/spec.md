# The judgement of a proposal against the spec

**Status:** in force · **Revision:** 2026-09-09 · **Scenario prefix:** `SC-AK`
**Depends on:** `specs-entry`
**Laws:** `work-conduct`, `verifiability`
**Procedures:** none

## Why

A proposal from the intake is taken into work by the text of the complaint. Whether it is right
nobody asks: there was nothing to compare it with, and now there is — the entry into the specs by
the name of a resource. What is still missing is the order that says the comparison is made before
the work, and the trace saying it was made at all.

Without the trace the comparison lives one session: whoever sorts out the same record tomorrow
starts from nothing and judges by the text of the complaint again. So a proposal arguing with the
way the package is designed goes into an edition on a par with a right one.

The subdomain names the three outcomes of the comparison and what holds the trace of it.

## Terminology

- **A proposal** — a record of the intake about an edit of the rules layer: the place, the reason
  and the quote of the nearest statement of the resource.
- **The comparison** — reading the statements of the spec about the named resource next to the text
  of the proposal.
- **An outcome** — one of three: the spec is right, the spec is wrong, the spec is silent.
- **The trace of the comparison** — the spec named at the move of the record into work; without it
  the move is refused.

### What it is called in the interface

The person sees the record and its state in the admin panel of the intake. The outcome itself has no
interface: it lives as the state of the record and as the named spec of the move.

## Rules

- **A proposal is compared with the spec about its resource before it becomes work.** The spec is
  found by the entry command, not by memory: the memory of a session ends with the session, and the
  next sorting out of the same record starts from the text of the complaint again.
- **The outcomes are three, and they are named in advance.** The spec is right — the proposal is
  disputable, and its place is not work. The spec is wrong — it is corrected, and the behaviour
  after it. The spec is silent — the question goes to the person. A list written after the fact is
  assigned by whoever it is convenient for.
- **The move of a proposal into work is refused while the spec it is compared with is not named.**
  The move says "this is taken"; without the named spec it says nothing about what it was judged
  against, and the comparison stays a claim of the executor.
- **The named spec is checked for existence before the network.** A path typed from memory looks the
  same as a read one, and once it has left for the intake nothing checks it any more.
- **An incident analysis is not asked for a spec.** It says what happened, not how the package
  should work: there is nothing to compare it with, and the requirement would stop the sorting out
  of analyses whole.
- **The correctness of a proposal is not counted by a machine.** It is judged by the executor
  against the spec; the machine holds the outcome and its trace. A machine sign "the proposal is
  right" errs in silence, and the error is read as a verdict.
- **The outcome "the spec is silent" is not turned into work by the executor alone.** More than a
  hundred resources of the package are spoken of by no spec, and to fix behaviour by such a proposal
  means writing the goal from the text of the complaint. The person is asked, and their word says
  which of the other two outcomes this becomes.

## States

| The state of the sorting out                 | What is done                                          |
| -------------------------------------------- | ----------------------------------------------------- |
| the record is new, the spec is not found     | the question goes to the person, the record stays new |
| the record is new, the spec is right         | the proposal is disputable and does not become work   |
| the record is new, the spec is wrong         | a task is created, the record moves into work         |
| the record is in work, the spec is not named | the move is refused before the network                |

## What is out of scope

- The entry into the specs by the name of a resource: it is a neighbouring subdomain, and here its
  answer is used.
- The place where a disputable proposal accumulates: the state of the record for that is a
  neighbouring work. Here the outcome is named, not the store for it.
- The wording of the proposals themselves: they arrive as they were written, and the language they
  are written in is a subject of its own.

## Contract

The surface is the mark command: the state, the records and the spec the proposal was compared
with. The answer is an exit code and lines for the person.

### Refusal codes

Not applicable: the command answers with an exit code and a text, not with named codes.

| What happened                                     | Code | What it says                                   |
| ------------------------------------------------- | ---- | ---------------------------------------------- |
| a proposal moves into work, the spec is not named | `1`  | what is missing and how the spec is found      |
| the named spec is not on disk                     | `1`  | the path and that there is no such file        |
| an analysis moves into work without a spec        | `0`  | as before: an analysis is not asked for a spec |
| a proposal moves into work with a named spec      | `0`  | as before: the list of records and the state   |

## Data

There is no storage of its own: the named spec is checked against the disk and travels with the
record's move; the intake keeps the state of the record.

## Screens and states

Not applicable: the sorting out has no screens of its own; the intake's admin panel shows the record
and its state.

## Cross-cutting requirements

### Locales

Not applicable: the refusal texts are single-language.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The requirement holds for the tree that sorts out the cargo. A tree that only sends cargo does not
move records into work at all, and the refusal never reaches it.

## Decisions

- **The trace is the named spec, not a separate field of the record.** A field would have to be
  taught to the intake, to the send and to the reading, while the move already carries arguments and
  is already refused for a missing fix text — the same technique, one more argument.
- **The path is checked for existence and not for being a spec.** A file that lies where the specs
  lie and is named as a spec is a spec; judging the content would mean parsing the sections at every
  mark. Rejected: reading the spec at the mark.
- **"The spec is silent" is not a fourth outcome but a question.** A fourth outcome would give the
  executor a lawful way to close a record by themselves, and the goal would be written from the text
  of the complaint.

## Open questions

- `Q-PV-1` — the named spec is not checked for speaking of the resource of that very record: the
  check would repeat the entry command at every mark, and the mark goes without the network too.
  A spec named at random passes.

## History of changes

- 2026-09-09 — the subdomain was created: the comparison of a proposal with the spec, the three
  outcomes and the trace of the comparison at the move into work.
