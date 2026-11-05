# The guard of the exits of a turn under an open epic

**Status:** in force · **Revision:** 2026-11-04 · **Scenario prefix:** `SC-AK`
**Depends on:** `docs/specs/agent-kit/turn-guards/exit/`
**Laws:** `work-conduct`
**Procedures:** none

## Why

The scenarios of the exit guard outgrew the file length limit again. The part of the guard that
reads the epic is split off: it has a subject of its own — the epic table, the epic branch and the
end of an epic — and the rest of the guard reads apart from it.

The subject of the subdomain is a turn under an open epic. The owner's standing word not to stop
until the epic is closed holds the exits the guard leaves open outside an epic.

## Terminology

- **An open epic** — an epic with at least one task left unfinished, as the table of the epic
  prints them. An epic that cannot be read is not open.
- **The epic branch** — a branch named by the header line of an epic plan in the plans directory.
  It has the shape of a task branch and carries no task folder by the rule.

The rest of the words — a turn, work, a tier, a service message — are in the neighbouring subdomain
of the same guard.

### What it is called in the interface

The subdomain does not come outward: the guard has no screens. Its refusal is read by the executor,
not by a person.

## Rules

- **A branch named by the header of an epic plan is an epic branch, and the tier of the taken task
  does not judge it.** The epic plan is written by the command that creates the epic and outlives
  the merge. A plan naming another branch releases nothing.
- **Under an open epic a turn that ended with work does not end.** The work stands where it stood;
  the refusal names the unfinished tasks of the epic and the next step. Outside an epic the turn is
  released as before.
- **Under an open epic a second pass over the turn is judged again.** The first refusal named the
  next step, and a turn ending again without a lawful exit is the same stop.
- **A handover written by hand releases a turn only outside an open epic.** On compaction the
  handover is written by the hook, not by a command of the turn; the refusal of the window guard
  releases as any refusal.
- **The owner's standing word quoted in the line «Waiting for the owner» releases the turn.** The
  guard reads their word, not a retelling: a line without a quote releases nothing, and the quote
  holds until the owner rewrites the line.
- **The end of an epic read from the table releases the whole turn on the way to a refusal.** The
  table was read and printed not a single task: the stop is lawful there, and the refusal of any
  tier lets the turn go — an empty turn, a second pass, a handover by hand, words about waiting for
  a word. An epic that cannot be read — no table, no epic behind the branch, the main branch after
  the merge — releases nothing, and the turn is judged as before.
- **The epic is read once per turn and only on the way to a refusal.** The reading goes to the
  hosting by the same command that prints the table of the epic to the owner.

## What is out of scope

The exits of a turn outside an epic — the last action, the lawful exits, the tiers of the stop — are
in the neighbouring subdomain of the same guard.

## Contract

The guard is called by the event of a stop and answers with a decision: let it through or give the
turn back with a reason.

### Refusal codes

Not applicable: the refusal comes as text naming the unfinished tasks of the epic and the next step.

## Data

The subdomain holds no data of its own. It reads the table of the epic, the plans directory and the
waiting line of the progress.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The refusal is written in the language of the tree.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable: the guard judges one turn of one session.

## Decisions

- **An open epic closes the two exits the guard used to leave open.** A turn that ended with work
  and a second pass over the turn released the executor three times in one day under the owner's
  standing word not to stop until the epic is closed. The tiers lie in a file of their own next to
  the guard: the guard reached the length limit.

## Open questions

None.

## History of changes

- 2026-11-04 — the subdomain was split off from the exit guard: its scenario file outgrew the file
  length limit with the scenario of a turn woken by an own notification.
