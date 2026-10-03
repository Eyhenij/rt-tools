# Grill

## The owner request

> обнови npm пакеты

The majors of that request were moved into the list RT-2081, one task per major. RT-2505 is the
third of them, after RT-2501 and RT-2503.

## What the tree already has

- `eslint` and `@eslint/js` 9.39.5, `eslint-plugin-simple-import-sort` 12.1.1, `jsonc-eslint-parser`
  2.4.2 in the root manifest.
- The plugins the config loads accept eslint 10: `@angular-eslint/*` and `@nx/eslint` `^9 || ^10`,
  `@typescript-eslint/*` up to `^10`, `eslint-plugin-sonarjs` up to `^10`.
- `eslint-plugin-import` 2.32.0 caps eslint at `^9`, and nothing in the tree loads it: its name
  stands only in `package.json`.
- eslint 10.12.0 is from 2026-10-02; 10.11.0 from 2026-09-18.

## What the rules already say

- `dependencies`: an exact number; a fresh version waits; after a linter update new rules are sorted
  out by name, their findings come on files the edit did not touch.

## Questions and answers

**What this copy takes next**
Задачи вне эпиков

## Decisions

- Question closed by assumption: 10.11.0, not 10.12.0 — the latter is a day old.
- Question closed by assumption: `eslint-plugin-import` is removed, not kept: unused, and it blocks
  the major.

## What is left unclear

- Nothing.
