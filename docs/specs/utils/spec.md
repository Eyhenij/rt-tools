# The utils package

**Status:** in force · **Revision:** 5 October 2026 · **Scenario prefix:** `SC-UT`
**Depends on:** none
**Laws:** `verifiability`, `code-structure`
**Procedures:** none

The functions of `@rt-tools/utils` are described one by one in the `CONTEXT.md` next to each.
This spec holds what is true for the whole package and the agreements written before the code;
each agreement is a subdomain with its own rules and scenarios.

| Subdomain                                               | What it agrees                          |
| ------------------------------------------------------- | --------------------------------------- |
| [The text colour on a background](color-on-background/) | the colour functions from the first kit |

## Why

The package is the framework-free shelf of the tree: kits and applications take small pure
functions from it instead of keeping their own copies, which drift apart silently.

## Terminology

| Term              | What it is                                                      |
| ----------------- | --------------------------------------------------------------- |
| a function folder | a directory named after the function, with its spec and CONTEXT |

### What it is called in the interface

Not applicable: the package has no screen.

## Rules

- **Every exported function has a spec, and a function without one fails the run.**

## What is out of scope

- Angular, RxJS and anything else a framework brings: the package stays framework-free.

## Contract

Not applicable: the surface is exported functions, not procedures.

### Refusal codes

Not applicable.

## Data

Not applicable: the package keeps nothing.

## Screens and states

Not applicable: the package has no screen.

## Cross-cutting requirements

### Locales

Not applicable: the functions return no words, except the month names of the date functions, which
their CONTEXT describes.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable: the functions are pure.

## Decisions

- **The package got a spec with its first agreement, task RT-2524.** Until then the CONTEXT files
  were the whole description, and an agreement written before the code had nowhere to live.

## Open questions

None.

## History of changes

- 5 October 2026 — the spec was started by task RT-2524.
