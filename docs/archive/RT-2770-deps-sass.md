# Grill

## The owner request

> обнови все пакеты до самых последних

## What the tree already has

- `pnpm outdated -r` on 2026-10-12 lists the style builders behind: sass 1.104.1 against 1.105.1,
  postcss 8.5.28 against 8.5.29, autoprefixer 10.5.6 against 10.6.1. All three are released more
  than a week ago.
- They are declared in the root manifest only; no published package names them.
- They change the built CSS of both kits, so the change is judged by the showcase frames of both
  kits and by the admin suite, not by the build alone.

## Decisions

- **A frame that diverges is read by eye before any retake**, and each retaken frame is named in
  the PR.
