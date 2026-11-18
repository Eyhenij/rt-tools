---
name: package-release
kind: rule
law: delivery
description: This tree's rule for releasing a package built without a framework — the built package is loaded as a consumer loads it before publication. Take it on a publication workflow, the loading check, the wiring check and any start of a release.
---

# Releasing a package without a framework

A rule of this tree under the law `docs/constitution/delivery.md`. It stands next to `git-workflow`
and `deploy-flow`: those say how an edit reaches the main branch and production; this one says what
must be true of a package before it reaches the registry, where it cannot be taken back.

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

- **A package built from a copy of another package's pipeline carries every step of that pipeline,
  and the `verify` step is one of them.** The project has a `verify` target, the root command
  `build:<package>` runs it, and the publication workflow builds through that command. The push
  set takes only projects that have a `verify` target, so a package without one is invisible to it.
- **A built package is loaded the way a consumer loads it before it is published.** Both entry
  points load from the built folder, and the package packed as it will be published is installed
  into an empty folder and loaded by its name. The workspace bundler resolves what Node does not,
  and a package that builds and passes its tests here can still be unloadable.
- **Every relative import of the built ESM names a file that exists, with its extension.** Node
  never guesses a missing extension.
- **A commit header written by a publication workflow obeys the same list as a hand-written one.**
  The workflow writes the header at the release, long after the pull request checks, and a header
  the list refuses fails the release at its first commit step.
- **A refusal of the commit check on one's own commit names a string that lives elsewhere too.** It
  is searched across the tree before the commit is fixed, not corrected only in the commit.
- **A release starts only when the check passes.** The start of a publication workflow is refused
  while the build, the loading check or the wiring fails, and the refusal names the fault.
- **"Built" and "tested" are not "consumable".** A statement that a package is ready names the
  command that loaded it as a consumer would, and its output.

## What of the law is not here

Whether a consumer's own bundler or runtime loads the package is not checked: the check loads it in
Node and from an unpacked tarball, which is what the registry serves. A runtime that resolves
differently (a bundler with its own rules, another runtime) is the consumer's to confirm, and the
first consumer's report is the only trace of that.

## Pitfalls

- **A copy of a pipeline is judged by its steps, not by its names.** A renamed command that runs
  fewer steps reads as the same command. The wiring check compares the steps.
- **A new area in a commit header goes into the list of the commit check in the same change.** The
  area named by the publication workflow is not known to the header check until it is added.
