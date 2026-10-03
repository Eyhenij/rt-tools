# Grill

## The owner request

> обнови npm пакеты

The majors of that request were moved into the list RT-2081, one task per major. RT-2503 is the
second of them, after RT-2501.

## What the tree already has

- `jsdom` 27.4.0 in the root manifest; 30.1.1 is out since 2026-09-22.
- It is taken by `jest-preset-angular` (`>=26.0.0`), the Jest environment and vitest (`*`): no
  dependent caps it.
- webpack-dev-server 6 from the same list is capped by `@nx/webpack` (`^5.0.0`) and stays.

## What the rules already say

- `dependencies`: an exact number, the upper bound comes from the dependents' peer ranges.

## Questions and answers

**What this copy takes next**
Задачи вне эпиков

## Decisions

- Question closed by assumption: the test failures caused by the new environment are fixed in the
  same branch; a failure unrelated to jsdom is filed apart.

## What is left unclear

- Nothing.
