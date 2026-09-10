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

## Task footprint

<What the work touches. Filled in by the exploration before the grill and confirmed by the owner.
By this same table, at closing, one looks at which of the specs, rules and patterns went stale:
what is named here is read twice — before the work and after it.>

| What  | Where                            |
| ----- | -------------------------------- |
| Specs | <domains the work touches>       |
| Laws  | <laws along its footprint>       |
| Rules | <rules and their companions>     |
| Code  | <libs and applications>          |

## What counts as done

- <a statement that can be checked>

## Stages

### 1. <name>

- **Steps:**
    1. <what is done first>
    2. <what is done after it>
- **Readiness sign:** <what must become true>
- **Verified by:** `<command>` — <what in its output means "it matched">

The steps are the smallest unit of the work, and they are written here in full: the progress
mirrors this list with its marks, and a check matches the two by number and by name. A step is
named by what is done, not by what is thought over — a line nobody can call done is not a step.

The command is written in backticks: the turn exit guard reads it and does not let out a turn in
which the stage is declared closed and the command was not run. An acceptance written in prose
cannot be confirmed by anything.

## What this work does not do

- <neighbouring work that is not dragged in here, and where it is created>
