# Plan

**Task:** RT-3304 · **Branch:** RT-3304-remove-ui-kit-v1
**Behaviour:** unchanged — the owner ordered the whole package removed: «удали полностью первый кит и весь связанный код»; no application uses it

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** the repository holds two kits; the first is frozen, and every push still builds,
  lints, tests and shoots it.
- **This task reaches:** one kit in the repository; the push set has no step of the first kit.
- **Sign:** `git grep -l "@rt-tools/ui-kit\b"` outside the archive and changelogs is empty; the
  push set printed by `rt_push_checks` has no `visual-gate.mjs ui-kit` line.
- **Milestone G of the epic:** the first kit is removed from the repository.
- **Metric:** нет: removal, not an improvement of a rule.

## Task footprint

| What   | Where                                                                     |
| ------ | ------------------------------------------------------------------------- |
| Specs  | `docs/specs/ui-kit/` (removed)                                            |
| Rules  | `.claude/skills/` of this tree, overrides in `.claude/rt-kit/overrides/`  |
| Code   | `projects/ui-kit/` (removed), `tools/`, `.github/workflows/`, root config |
| Texts  | `README.md`, `CLAUDE.md`, `docs/`                                         |

## What counts as done

- `projects/ui-kit` and `docs/specs/ui-kit` are gone.
- A search for the first kit outside the archive and changelogs finds nothing.
- `pnpm run check:all` is green.

## Stages

### 1. The package and its build are gone

- **Steps:**
    1. Remove `projects/ui-kit`, `docs/specs/ui-kit` and the first kit's publish workflow
    2. Remove the first kit from `tsconfig.base.json`, `package.json`, the linters and the version scripts
    3. Remove the first kit's snapshot step from the pipeline
    4. Rebuild the lockfile
- **Readiness sign:** the workspace graph has no `@rt-tools/ui-kit` project.
- **Verified by:** `pnpm exec nx show projects` — no line `@rt-tools/ui-kit`

### 2. The tools and checks forget the first kit

- **Steps:**
    1. Remove the first kit from the tree profile and the checks settings
    2. Remove the first kit from the tools, their allowlists and signals
    3. Bring the scenarios of the tools and of the rules package up to date
- **Readiness sign:** the push set has no step of the first kit, the tool scenarios are green.
- **Verified by:** `bash tools/tests/run.sh` — «ALL SETS ARE GREEN»

### 3. The texts forget the first kit

- **Steps:**
    1. Bring the rules of this tree and the overrides up to date
    2. Bring `README.md`, `CLAUDE.md` and the documents up to date
- **Readiness sign:** the search finds the first kit only in the archive and changelogs.
- **Verified by:** `git grep -l -E "@rt-tools/ui-kit([^-]|$)|projects/ui-kit([^-]|$)" -- . ':!docs/archive' ':!**/CHANGELOG*.md'` — no output

### 4. The whole tree is green

- **Steps:**
    1. Run `pnpm run check:all`
    2. Run the push set
- **Readiness sign:** both are green.
- **Verified by:** `pnpm run check:all` — exit code 0

## What this work does not do

- The npm deprecation of `@rt-tools/ui-kit` — the owner's step.
- The revision of the push set beyond the first kit's steps — separate work after the epic.
