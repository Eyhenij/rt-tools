# Grill

## The owner request

> обнови npm пакеты

The majors of that request were moved into the list RT-2081, one task per major. RT-2507 is the
fourth of them, after RT-2505.

## What the tree already has

- `stylelint` 16.26.1, `stylelint-config-standard` 39.0.1, `stylelint-scss` 6.14.0 in the root
  manifest. `stylelint-config-standard-scss` 17.0.0 already demands stylelint `^17` — the set is
  mixed today.
- The other plugins accept 17: `stylelint-config-idiomatic-order` `>=11`, `stylelint-prettier`
  `>=16.0.0`.
- Two rules of the tree in `tools/stylelint-rules/` are CommonJS; one of them is 731 lines, so
  moving it to a module file would also bring it under the length limit.
- stylelint 17.16.0 is from 2026-10-01; 17.15.0 from 2026-09-04.

## What the rules already say

- `dependencies`: an exact number; a fresh version waits; new rules after a linter update are
  sorted out by name.

## Questions and answers

**What this copy takes next**
Задачи вне эпиков

## Decisions

- Question closed by assumption: 17.15.0, not 17.16.0 — the latter is two days old.
- Question closed by assumption: the CommonJS rules stay as they are if stylelint 17 loads them; a
  move to modules only if it does not.

## What is left unclear

- Nothing.
