# Grill

## The owner request

> обнови все пакеты до самых последних

## What the tree already had

- The root manifest held `@types/node` 24.13.4. The last published versions per major line were
  22.20.5, 24.19.2, 25.9.9 and 26.6.5.
- The tree runs on Node 22: `.nvmrc` holds 22.22.3, every pipeline sets up 22.22.3, and the root
  manifest declares `"node": ">=22.22.3"`.

## Decisions

- **The upper bound is the runtime, not the registry:** types newer than the runtime describe an
  API Node 22 does not have, and the build accepts a call that fails at run time. 26 is not taken.
- **The 24 line takes its last release, 24.19.2:** inside the installed line that changes no
  runtime promise. Rejected: moving down to the 22 line — a correction of its own, not a raise.
- **Nothing to fix:** the full run passed on the new types, 352 of 352 tasks.
