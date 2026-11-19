---
name: dependencies
kind: rule
law: delivery
description: Rule under the delivery law. Load when editing package.json, the lockfile and the workspace settings, and when upgrading any package. Names the exact version number instead of a range and the waiting period for a new version. Pattern dependencies-upgrade.
---

# Dependencies — how it works here

Rule under the law `docs/constitution/delivery.md`. Cold part: `pitfalls.md`. Where it lives: the
table in `implementation.md` next to it.

## How the law applies here

- **A package version is written as an exact number.**
- **Substituted versions of foreign dependencies are gathered in one list, and it is revisited at
  every update.**
- **A fresh version waits first, and one needed before the term is written out separately.**
- **Only what the linter checks the formatting of gets reformatted.** `.md` and `.json` are checked
  by nobody here.
- **A package that carries styling is raised by a task of its own.** Skipped releases go first, by
  that task; the feature branch takes only the last step.

## Patterns

- `dependencies-upgrade` — raise a package: the term, the substitutions, the check of the snapshot.
