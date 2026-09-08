# Plan

**Task:** RT-1873 · **Branch:** RT-1873-material-icon-set
**Draft:** `docs/specs/ui-kit-v2/proposed/icon-mapping/`
**Behaviour:** changes

Замысел ещё не написан: просьба не разобрана. Договорённость о соответствии значков будет названа
здесь тем же ходом, каким её напишут.

A tree that writes the agreement straight into the domain spec names it instead of the draft:
`**Spec:** `<path to the spec>``.

Work that does not touch application code needs no agreement — then instead of the draft line
stands `**Behaviour:** unchanged — <the owner's reason>`; an empty reason is not accepted.

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

<What the work touches. Filled in by exploration before the grill and confirmed by the owner. By
this same table, at closing, one sees what of the specs, rules and patterns has gone stale: what
is named here is read twice — before the work and after it.>

| What  | Where                         |
| ----- | ----------------------------- |
| Specs | `docs/specs/<domain>/`        |
| Laws  | `docs/constitution/<name>.md` |
| Rules | `.claude/skills/<name>/`      |
| Code  | `projects/<package>/`         |

## What counts as done

- <a statement that can be checked>

## Stages

### 1. <name>

- **What is done:** <in one phrase>
- **Readiness sign:** <what must become true>
- **Verified by:** `<command>` — <what in its output means "it matched">

The command is written in backticks: the turn exit guard reads it and does not let out a turn in
which the stage is declared closed and the command was not run. An acceptance written in prose
cannot be confirmed by anything.

## What this work does not do

- <neighbouring work that is not dragged in here, and where it is created>
