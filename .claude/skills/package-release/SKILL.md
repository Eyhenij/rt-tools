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
  pipeline.** Three links: a `verify` target depending on the build, `build:<package>` running it,
  the publication workflow building through that command. The push set sees only projects with a
  `verify` target; the wiring check compares these three steps and no others.
- **A built package is loaded the way a consumer loads it before it is published.** Both entry
  points load from `dist`; the packed tarball is installed into an empty folder and loaded by name.
- **Every relative import of the built ESM names a file that exists, with its extension.**
- **A commit header written by a publication workflow obeys the same list as a hand-written one.**
  The list of areas of the commit check: a missing area fails the release at its first commit step.
- **A refusal of the commit check on one's own commit names a string that lives elsewhere too.** It
  is searched across the tree before the commit is fixed.
- **A release does not go out unless the built package loads.** The barrier is the root build
  command ending in `nx verify`, run by the publication workflow itself: a start from the browser,
  `gh api` or a variable passes the start guard and stops there. Not judged: framework packages,
  `agent-kit`, `auth-import` and `NOT_JUDGED`.
- **The build with the loading check comes before the step that moves the version.**
- **"Built" and "tested" are not "consumable".** A readiness claim names the command that loaded the
  package as a consumer would, and its output.
