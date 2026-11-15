# Plan

**Task:** <KEY>-<number> · **Branch:** <branch>
**Draft:** `<path to the product agreement>`
**Behaviour:** changes

A tree that writes the agreement straight into the domain spec names it instead of the draft:
`**Spec:** `<path to the spec>``.

Work that does not touch application code needs no agreement — then instead of the draft line
stands `**Behaviour:** unchanged — <the owner's reason>`; an empty reason is not accepted.

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** <where the product stands now>
- **This task reaches:** <the change a person will see>
- **Sign:** <the command, the page or the number that shows it, and who sees it>
- **Milestone G of the epic:** <the point named in the epic plan>
- **Metric:** <only for an improvement of a rule, a hook, a check or a role: the number, the direction, the baseline — pattern `task-flow-cycle`; a repair writes «нет: <what was broken>»>

## Task footprint

<What the work touches. Filled in by the exploration before the grill and confirmed by the owner.
By this same table, at closing, one looks at which of the specs, rules and patterns went stale:
what is named here is read twice — before the work and after it.>

| What             | Where                            |
| ---------------- | -------------------------------- |
| Specs (правится) | <domains the work touches>       |
| Laws             | <laws along its footprint>       |
| Rules            | <rules and their companions>     |
| Code (правится)  | <libs and applications>          |

A row the work edits carries the mark «(правится)» after its name; a row read only for context
carries none. Where the engine of the task flow is laid out, it measures the end of the stages by
the marked rows: after the commit of the plan the branch changes at least one file under every
path of every marked row. A plan with no marked row is judged only by its agreement directory under
`proposed/`.

## What counts as done

- <a statement that can be checked>

## Stages

### 1. <name>

- **Steps:**
    1. <what is done first>
       Check: `<command>` → <expected>
    2. <what is done after it>
       Check: `<command>` → <expected>
- **Readiness sign:** <what must become true>
- **Verified by:** `<command>` — <what in its output means "it matched">

The steps are the smallest unit of the work, and they are written here in full: the progress
mirrors this list with its marks, and a check matches the two by number and by name. A step is
named by what is done, not by what is thought over — a line nobody can call done is not a step.

Under every step stands its check: the command in backticks, an arrow and the expected result in
one of the forms below. The parsing takes the word «Check:» and its Russian form alike, and the
check line is not part of the step name. Where the engine of the task flow is laid out, it runs the
command as the commit of the plan wrote it and marks the step only when the result matches.

| Expected | It matches when |
| -------- | --------------- |
| `exit N` | the command exits with code N; the output is not compared |
| `` `text` `` | the code is 0 and the last non-empty line of the output equals the text |
| `/expression/` | the code is 0 and the last non-empty line matches the expression |
| `= N`, `>= N`, `<= N` | the code is 0, the last non-empty line is an integer, and the comparison holds |

A command of the work itself — a commit, a push, a PR, a task or a layout — is never a check.

The command is written in backticks: the turn exit guard reads it and does not let out a turn in
which the stage is declared closed and the command was not run. An acceptance written in prose
cannot be confirmed by anything. The command is run right here, while the plan is written, not at
the end of the stage: its output is what names the readiness sign. A sign written by a guess is
sometimes impossible to meet — the line the stage must put out comes from an unconfigured tree
rather than from the work — and that is found out latest of everything that depended on it.

## What this work does not do

- <neighbouring work that is not dragged in here, and where it is created>
