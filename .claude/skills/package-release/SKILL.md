---
name: package-release
kind: rule
law: delivery
description: This tree's rule for releasing a package built without a framework — the built package is loaded as a consumer loads it before publication. Take it on a publication workflow, the loading check, the wiring check and any start of a release.
---

# Releasing a package without a framework

A rule of this tree under the law `docs/constitution/delivery.md`. Cold part: `pitfalls.md`.

## What it is called here

| In the law               | Here                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| a package without a framework | a project under `projects/` that builds twice with `tsc`: the targets `build:esm` and `build:cjs`    |
| the built package        | the folder `dist/<package>`, the same one that is published                                           |
| a release                | a manual start of `.github/workflows/publish-<package>.yml`                                           |
| the loading check        | `tools/verify-package.cjs`, the `verify` target of the project                                        |

## Where it lives

The table in `implementation.md` next to it.

## How the law applies here

- **A package built from a copy of another package's pipeline carries the `verify` step of that
  pipeline.**
- **A built package is loaded the way a consumer loads it before it is published.**
- **Every relative import of the built ESM names a file that exists, with its extension.**
- **A commit header written by a publication workflow obeys the same list as a hand-written one.**
- **A refusal of the commit check on one's own commit names a string that lives elsewhere too.**
- **A release does not go out unless the built package loads.**
- **The build with the loading check comes before the step that moves the version.**
- **"Built" and "tested" are not "consumable".**
