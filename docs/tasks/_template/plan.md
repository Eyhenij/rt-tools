<!-- rt-kit v0.25.0 · samples/tasks/_template/plan.md · 6e2a1f539db5 · правится надстройкой, не здесь -->
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

- **What is done:** <in one phrase>
- **Readiness sign:** <what must become true>
- **Verified by:** `<command>` — <what in its output means "it matched">

The command is written in backticks: the turn exit guard reads it and does not let out a turn in
which the stage is declared closed and the command was not run. An acceptance written in prose
cannot be confirmed by anything.

## What this work does not do

- <neighbouring work that is not dragged in here, and where it is created>

## След задачи

<Что работа задевает. Заполняется разведкой до разбора и подтверждается владельцем. По этой же
таблице на закрытии смотрят, что из спеков, правил и паттернов устарело: названное здесь
читают дважды — до работы и после неё.>

| Что     | Где                          |
| ------- | ---------------------------- |
| Спеки   | `docs/specs/<домен>/`        |
| Законы  | `docs/constitution/<имя>.md` |
| Правила | `.claude/skills/<имя>/`      |
| Код     | `projects/<пакет>/`          |
