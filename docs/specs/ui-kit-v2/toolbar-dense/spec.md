# The long title of a dense toolbar

**Status:** in force · **Revision:** 2026-10-08 · **Scenario prefix:** `SC-UKV`
**Depends on:** the toolbar of the second kit
**Laws:** `frontend-application`
**Procedures:** none

The subdomain names what a dense toolbar does with a left slot wider than the place left to it.

## Why

A dense toolbar stays one row on a narrow screen: the header of a correspondence is built on it.
Its left part did not shrink, so a long title in it ran past the right edge of the column and was
cut by it. The person saw neither the end of the title nor a sign that it was cut.

## Terminology

| Term          | What it is                                                           |
| ------------- | -------------------------------------------------------------------- |
| Dense toolbar | a toolbar with the `dense` input: one row at any width of the screen |
| Left slot     | the content declared by `rtToolbarLeft`, usually the title           |

### What it is called in the interface

| In the spec | On the screen                                           |
| ----------- | ------------------------------------------------------- |
| Left slot   | the title «Переписка №12 — Анна Смирнова» in the header |

## Rules

- **The left part of a dense toolbar shrinks to the place left to it.** A long title wraps by words
  inside it, and nothing of it stands past the right edge of the toolbar.
- **The right part of a dense toolbar keeps the width of its buttons.** A long title does not push
  the buttons out and does not squeeze them.
- **An ordinary toolbar lays out as before.** Its left part does not shrink: the header of a list
  holds the page title there, and on a narrow screen the toolbar folds into a column anyway.

## What is out of scope

- **Truncation with an ellipsis.** A title of a correspondence carries a number and a name, and both
  must be read at once.

## Contract

Not applicable: the subdomain describes the layout of a component, not an exchange with the server.

### Refusal codes

Not applicable.

## Data

Not applicable.

## Screens and states

| State              | What is visible                                            |
| ------------------ | ---------------------------------------------------------- |
| The title fits     | one row: the title on the left, the buttons on the right   |
| The title is wider | the title in two lines, the buttons on the right as before |

## Cross-cutting requirements

### Locales

The title text arrives from the consumer: the kit does not translate it.

### SEO

Not applicable.

### Mobile layout

This is the case the subdomain is about: a dense toolbar in a column of a phone.

### Several objects

Not applicable.

## Decisions

- **Only the dense toolbar shrinks its left part.** The argument: the ordinary one folds into a
  column on a narrow screen, and the left part there gets the whole width. The price: an ordinary
  toolbar in a narrow column wider than 768 points still holds its left part unshrunk.

## Open questions

- None.

## History of changes

- 2026-10-08 — created by the work about the title of a correspondence header on a phone.
