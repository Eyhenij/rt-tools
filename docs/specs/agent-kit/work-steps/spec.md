# The steps of the work are written out, marked and counted

**Status:** in force · **Revision:** 2026-09-10 · **Scenario prefix:** `SC-AK`
**Depends on:** `docs/specs/agent-kit/epic-stop/spec.md`
**Laws:** `work-conduct`
**Procedures:** none

## Why

A plan held its stages as prose: what is done, what must become true, which command confirms it.
Inside a stage there were no steps at all, and the number of them could not be named. The progress
named the stage by its ordinal and the next move by a sentence — both written by hand and matched
against nothing.

So a turn that broke off in the middle of a stage passed every tier of the turn guard: there was
work in it, and the last action was a command. The owner read such a turn as a stop and restarted
the session — four times in one day on one epic.

The neighbouring subdomain closed the same miss one level up: while the epic holds tasks, a turn
does not end. It says nothing about a turn inside one task, and an epic holds a single task as
lawfully as ten.

The subdomain writes the steps out, marks the one going on right now, matches the two records and
gives the count to the guard.

## Terminology

- **A step** — the smallest unit of the work: a line that can be called done or not done. It is
  numbered by the stage it belongs to and by its place inside it.
- **The list of the plan** — the steps of every stage, written before the work starts and not edited
  afterwards.
- **The list of the progress** — the same steps with a mark each, rewritten by every turn that moves
  the work.
- **The current step** — the step marked as going on right now. There is only ever one of them.
- **A step that is not done** — one marked as not begun or as going on right now.

### What it is called in the interface

There is no interface: the check answers with an exit code and a list of divergences, the guard with
a refusal in the executor's own turn.

## Rules

- **The plan names the steps of every stage, and the progress mirrors them with a mark each.** The
  plan is not edited after it is written, the marks change with every turn: kept in one record,
  either the plan is edited or the mark is lost.
- **The numbers and the names of the steps are copied, not reworded.** Two lists in two records
  diverge silently, and a reworded name reads as a different step: the count of what is left then
  answers about something else.
- **Exactly one step carries the mark of going on right now, while any step is not done.** Marked on
  none, the record says the work stands; marked on two, it says nothing at all.
- **Every step is done — no step carries the mark of going on right now.** The work is over, and a
  step still called current says the record was not rewritten.
- **A step of the plan that is not done forbids a stop of the turn.** A turn that did work and then
  reported is no exception: the report ends the account, not the work.
- **The refusal names the remainder, the current step and the command that counted them.** Told only
  "the work is not finished", the executor rewrites the mark instead of doing the step.
- **The count is read from the record of the progress, not from the hosting.** It is a local file:
  it costs nothing, so it is asked on every turn — unlike the state of the epic.
- **A plan that names no steps is not judged, and neither is a progress without the list.** The
  requirement arrives with the sample of the plan, and the folders written before it stay lawful.
- **A plan whose step names still stand as the sample wrote them is not judged.** That is the sample
  itself and a folder just copied from it: judged, every fresh folder would be red before a line of
  work is done in it.
- **A progress that carries the list while the plan names no steps is a divergence.** The list was
  written from the head, and nothing behind it holds.
- **The word of the owner about a stop lifts the refusal, and the guard reads it from them.** The
  same reading as everywhere else: their message, not a retelling of it.

## What is out of scope

- The shape of the plan's stages: the readiness sign and the acceptance command stay as they were.
- The states of the work: the unit stays a state, and the steps live inside a stage.
- The count of the epic's unfinished tasks: it is the neighbouring subdomain, and it judges the
  whole.

## Contract

Two surfaces. The check is a command over the task folders: the exit code and the list of
divergences. The guard is a tier at the end of a turn: the refusal text and the decision.

### Refusal codes

Not applicable: the check answers with an exit code, the guard with a decision and a text.

| What happened                              | Code | What it says                                 |
| ------------------------------------------ | ---- | -------------------------------------------- |
| the lists match                            | `0`  | how many folders were read                   |
| the lists diverge by count, number or name | `1`  | every divergence, a line each                |
| the current step is not exactly one        | `1`  | how many are marked and how many are left    |
| the plan names no steps                    | `0`  | nothing: there is nothing to match           |
| a step is not done and the turn ends       | deny | the remainder, the current step, the command |

## Data

There is no storage of its own. The lists are read from the two records of the task folder.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

### Locales

Not applicable: the refusal is single-language, and it is the language of the rules layer.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The check and the guard live in the package and are laid out into every consumer tree. What is its
own in each of them — the directory of the task folders — is read from the settings of the tree.

## Decisions

- **The steps live in the plan, the marks in the progress.** Rejected: one record for both — the
  plan would then be edited along the way, and acceptance would have nothing to check against.
- **The current step is marked inside the list, not by a line of its own.** A separate line diverges
  from the list silently, and the divergence is visible only by eye.
- **The count is read from the file, not computed by the check.** The guard must answer in a tree
  where the check was never run; a reading of its own would diverge from the printed list.

## Open questions

- `Q-WC-11` — a step nobody can call done passes both the check and the guard: they judge the marks,
  not what stands behind them. Only whoever reads the plan sees that.

## History of changes

- 2026-09-10 — the subdomain was created: the steps are written out in the plan, marked in the
  progress, matched by a check and counted by the guard of the turn.
