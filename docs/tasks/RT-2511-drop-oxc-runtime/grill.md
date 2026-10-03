# Grill

## The owner request

> обнови npm пакеты

The list RT-2081 names `@oxc-project/runtime` a candidate for removal, not for an upgrade. RT-2511
takes it after RT-2509.

## What the tree already has

- `@oxc-project/runtime` 0.115.0 in the root manifest's dev dependencies; nothing in the tree
  imports it, and `pnpm why` shows only the root.
- It arrived with the commit that started the receiver's admin panel; the commit body gives no
  reason.
- rolldown, which the Angular builder bundles with, can inject imports of helpers from this
  package into built code.

## What the rules already say

- `dependencies`: the tree snapshot goes in the same commit as the declaration; the suite is run
  whole.

## Questions and answers

**What this copy takes next**
Задачи вне эпиков

## Decisions

- Question closed by assumption: the package is removed if every build passes without it; if one
  looks for it, it stays and the reason is written next to it.

## What is left unclear

- Nothing.
