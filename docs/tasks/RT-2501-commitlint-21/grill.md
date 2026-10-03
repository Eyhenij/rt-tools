# Grill

## The owner request

> обнови npm пакеты

The word was said for RT-2079; the majors were moved from it into the list RT-2081, one task per
major. RT-2501 is the first of them, taken while PR #2500 waits for CI: the owner's word «Задачи
вне эпиков» names this queue.

## What the tree already has

- `@commitlint/cli`, `@commitlint/config-angular`, `@commitlint/config-conventional` at 20.5.3 in
  the root manifest; 21.2.3 is out since 2026-09-19.
- `commitlint.config.cjs` is called by `.husky/commit-msg`.

## What the rules already say

- `dependencies`: an exact number, a fresh version waits, a major goes by a task of its own.

## Questions and answers

**What this copy takes next**
Задачи вне эпиков

## Decisions

- Question closed by assumption: all three packages move together — the config packages are
  released in step with the command.

## What is left unclear

- Nothing.
