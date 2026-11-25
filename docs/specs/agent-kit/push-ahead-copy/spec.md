# The run ahead and its copy

**Status:** in force · **Revision:** 25 November 2026 · **Scenario prefix:** `SC-AK`
**Depends on:** `push-gate-ahead`, `push-set-usefulness`
**Laws:** `verifiability`, `delivery`
**Procedures:** none

What the run ahead says when the copy it checks changed under it, and how it ends when it is stopped.

## Why

The run ahead puts a mark only on a clean copy and an unchanged tree. Its verdict did not look at the
marks: a run over an edited copy went on over mixed content, wrote no mark and ended with «the set is
green» and the code 0. While the set ran alone after all the edits, the order hid it. Once the set
runs beside a reading of the change, an edit under it is an ordinary case. So is a stop: a finding
has to be fixed, and the run in the background goes on over what is being edited.

## Terminology

- **The run ahead**, **a green mark** — as in `push-gate-ahead`.
- **A changed copy** — a copy with an edit outside the index, the record of observations aside.
- **The tree of a step** — the step and every process it started, in whatever group.

### What it is called in the interface

There is no interface: the run answers with lines of output and an exit code.

## Rules

- **An edit left in the copy ends the run after the step it was seen after.** The next steps would run
  over content no commit holds and leave no mark. The run names the edited paths and that step.
- **A run every green step of which holds its mark on the head is green; any other is not judged.** The
  marks are asked at the end, of the steps the run started and of the ones it found green already: a
  commit made under a step changes the key of that step and of the steps before it. Steps that had
  nothing to look at hold no mark and are not asked.
- **A run that is not judged ends with a code of its own and is never called green.** The code 101 lies
  past the number of red checks. The last `push ahead:` line says «not judged».
- **A red check outweighs a changed copy.** The run ends with the number of red checks and names the
  change in a line above.
- **An edit made and put back inside one step is not seen.** The copy is looked at between the steps;
  whoever reads the change beside the run writes nothing into the copy.
- **A stopped run ends the tree of its step and keeps the marks of the steps before.** The first line of
  the run names its process number; `TERM` or `INT` sent to it ends the run with the code of the signal.
  The stopped step leaves no mark, and no step starts after it.
- **A stopped step gets `INT`, then `TERM`, then `KILL`.** The groups and the parents of its processes
  are told before the signal: a builder and a runner of end-to-end suites start theirs in groups of
  their own. A runner of suites puts its stand down by `INT` alone; a builder takes its scenarios with
  it by `TERM` within seconds, and killed at once it leaves them running.
- **A step reads an empty input.** One that read the list of steps as its input ate the rest of the set.

## What is out of scope

- The git hook before a push and the push guard: they run the light steps inside their own limit.
- `KILL` sent to the run itself: the run cannot see it, and the tree of the step stays.
- A container a step raised and did not put down: it is no process of the step. The step that names
  its container by the working copy removes the former one at its next start.
- When a tree starts the run — its own rules.

## Contract

The surface is the exit code and the lines of the run ahead.

### Refusal codes

Not applicable: the run refuses nothing. It exits with 0 — green, 1…100 — the number of red checks,
3 — the run did not start or three red checks, 101 — not judged, 130 and 143 — stopped by `INT` or
`TERM`. The last `push ahead:` line tells them apart.

## Data

None of its own: the marks and the pinned base belong to `push-gate-ahead`.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The lines of the run are in English, as the rest of the guards.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Working copies of one repository share the marks; a changed copy ends only its own run.

## Decisions

- **The run is not moved to a copy of its own.** It would need its own installed packages, and the
  line of a step names the pinned base by the branch, which one copy alone holds.
- **The processes of a step are found by their parents, not by the group.** On 25 November 2026 a step
  of the guard scenarios was stopped by `TERM` and by `KILL` five seconds later: its group was empty
  and 89 processes of the scenarios went on in another one.
- **The wait is seconds, not a question to the step.** Ten after `INT`, twenty after `TERM`; a tree that
  knows its steps moves the first by `RT_PUSH_STOP_WAIT`.

## Open questions

None.

## History of changes

- 25 November 2026 — the subdomain was created: the set runs beside the second reading of a change, and
  a run over an edited copy was called green. Task RT-3630.
