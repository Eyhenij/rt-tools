# The usage of the rules over all trees

**Status:** proposed · **Revision:** 2026-11-13 · **Scenario prefix:** `SC-MB`
**Depends on:** `message-bus/usage`
**Laws:** `verifiability`, `lists`
**Procedures:** none — the operations are declared by the controller of the usage reading

An agreement about the product written before the code. It is merged into the usage spec by the
last commit of the PR, with the same scenario numbers.

## Why

The section «Использование» opens with the tree filter on «Все проекты», the value every section
with this filter starts from. The receiver reads the usage only for a named tree and answers a
request without one with «tree unknown». The person who opens the section sees «Прочитать не
удалось» and nothing else, until they pick a tree by hand.

## Terminology

| Term         | What it is                                          |
| ------------ | --------------------------------------------------- |
| all trees    | the reading without a tree: every row of every tree |
| a named tree | the reading with a tree sign: the rows of that tree |

### What it is called in the interface

| Term      | On the screen |
| --------- | ------------- |
| all trees | «Все проекты» |

## Rules

- **A reading without a tree counts the rows of all trees.** It concerns the table, the digest and
  the sessions of a skill alike. A skill loaded by two trees is one row with the sum of both.
- **A named tree that the receiver does not know is still refused as «tree unknown».** A mistake in
  the sign must not read as all trees.
- **The digest is read for all trees as for a named one.** The cards above the table show the same
  rows the table counts.

## What is out of scope

- The reading with a named tree does not change.
- The section «Качество»: it already reads all trees without a tree.

## Contract

| Operation                      | What changes                                    |
| ------------------------------ | ----------------------------------------------- |
| GET /api/usage                 | `tree` is optional; without it — all trees      |
| GET /api/usage/digest          | `tree` is optional; without it — all trees      |
| GET /api/usage/:skill/sessions | `tree` is optional; without it — all trees      |

### Refusal codes

`treeUnknown` stays for a named sign the receiver does not know; it is no longer given for a missing
one.

## Data

Not applicable: the storage does not change.

## Screens and states

The section «Использование» with «Все проекты» shows the table and the digest over all trees instead
of the read refusal.

## Cross-cutting requirements

### Locales

Not applicable: no new words on the screen.

### SEO

Not applicable: the admin application is closed by sign-in.

### Mobile layout

Not applicable: the layout does not change.

### Several objects

Not applicable: the receiver has one owner.

## Decisions

- **All trees, not a removed option** — the tree filter is shared, and «Все проекты» already means
  all trees in the neighbouring sections and in «Качество».

## Open questions

None.

## History of changes

- 2026-11-13 — written.
