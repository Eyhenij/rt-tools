---
name: dependencies
kind: rule
law: delivery
description: Rule under the delivery law. Load when editing package.json, the lockfile and the workspace settings, and when upgrading any package. Names the exact version number instead of a range and the waiting period for a new version. Pattern dependencies-upgrade.
---

# Dependencies — how it works here

Rule under the law `docs/constitution/delivery.md`. Cold part: `pitfalls.md`. Where it lives: the
table in `implementation.md` next to it.

| In the law                        | Here                                                                   |
| --------------------------------- | ---------------------------------------------------------------------- |
| snapshot of the installed tree    | `pnpm-lock.yaml`; goes in the same commit as the declaration           |
| substitution of a foreign version | `overrides` in `pnpm-workspace.yaml`                                   |
| waiting period of a new version   | `minimumReleaseAge`; an earlier version by number in `minimumReleaseAgeExclude` |
| package manager                   | pnpm: `npm run` calls the scripts, `pnpm install` installs            |

## How the law applies here

- **A package version is written as an exact number.** `"prettier": "3.9.6"` in the root manifest;
  the published packages declare what they accept by a range. The check of this rule refuses a
  range in the root `package.json`, in the push set and in the pipeline. Manifest and lock are
  matched before the push only for an edit of either; otherwise in the pipeline, after the push.
- **Substituted versions of foreign dependencies are gathered in one list, and it is revisited at
  every update.** A stale entry silently rolls its dependency back after the main package is raised.
- **A fresh version waits first, and one needed before the term is written out separately.** The
  upper bound comes from dependents' peer ranges, not from the last number in the registry.
- **Only what the linter checks the formatting of gets reformatted.** After a formatter update its
  rewrite of `.md` and `.json` is not committed: nobody checks them here, the diff is noise.
- **A package that carries styling is raised by a task of its own.** Styling breaks silently: no
  lint, build or test reads it. Skipped releases go first, by that task; the feature branch takes
  only the last release.

## Patterns

- `dependencies-upgrade` — raising versions, choosing the upper bound, sorting out the consequences
  of an update.
