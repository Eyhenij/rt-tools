# Plan

**Task:** RT-2846 · **Branch:** RT-2846-cargo-texts
**Behaviour:** unchanged — texts of rules and patterns of the package; no application behaviour moves.

## Task footprint

| What  | Where                                                                                                                                                                                                                                                                     |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | none: the texts are the subject of no spec scenario                                                                                                                                                                                                                       |
| Laws  | none                                                                                                                                                                                                                                                                      |
| Rules | `projects/agent-kit/assets/rules/deploy-flow.github.md` and its two host variants, `projects/agent-kit/assets/rules/typescript-conventions.md`, `projects/agent-kit/assets/rules/component-structure.md`                                                                  |
| Code  | patterns in `projects/agent-kit/assets/patterns/`: `testing-e2e.md`, `git-workflow-migration.md`, `lib-layers-new.md`, `task-flow-archive.md`, `task-flow-resume.md`, `git-workflow-merge.md`, `spec-driven-domain.md`, the commit and PR patterns in three host variants |

## What counts as done

- Each of the eighteen records has its item in the nearest existing section of its text.
- Records that state one thing are one item.
- No file crosses the prose limit; the layout audit and the text checks are clean.

## Stages

### 1. End-to-end pattern

- **Steps:**
    1. Add the item "a default equal to the first option proves nothing".
    2. Fold "a call the task adds to a screen" into the item about header calls.
    3. Add to the polling section the layout values after a width change.
- **Readiness sign:** the three items stand in `testing-e2e.md`.
- **Verified by:** `node tools/check-file-size.mjs` — no file longer than the limit.

### 2. Migration, deploy and lib layers

- **Steps:**
    1. Add the article about a copy before a migration without a reverse to the deploy rule in three variants.
    2. Add the client regeneration and the data-erasing migration items to the migration pattern.
    3. Add the literal `sourceTag` item to the lib-layers-new pattern.
- **Readiness sign:** the article stands once in the rule, the pattern points to it.
- **Verified by:** `node tools/check-file-size.mjs` — no file longer than the limit.

### 3. Task records

- **Steps:**
    1. Say in the archive pattern that the grill moves in the owner's language.
    2. Add the item about a folder created after the work to the archive pattern.
    3. Add the new request of the owner inside the same task to the resume pattern.
- **Readiness sign:** the three items stand in their patterns.
- **Verified by:** `node tools/check-file-size.mjs` — no file longer than the limit.

### 4. Merge, commit and PR

- **Steps:**
    1. Extend the checks after a merge to a merge without conflicts and add the item about migrations.
    2. Add the case of the subject and the `Docs-skip` line read from the command text to the commit pattern in three variants.
    3. Add the check of the base on the host to the PR pattern in three variants.
- **Readiness sign:** each item stands in every host variant.
- **Verified by:** `node tools/check-file-size.mjs` — no file longer than the limit.

### 5. Code rules and spec pattern

- **Steps:**
    1. Add the split of a file past the limit to `typescript-conventions` and a pointer in `component-structure`.
    2. Add the decision moved out of the handler to `typescript-conventions`.
    3. Add the changed or removed scenario item to `spec-driven-domain`.
- **Readiness sign:** the items stand in their files.
- **Verified by:** `node tools/check-file-size.mjs` — no file longer than the limit.

### 6. Layout and gate

- **Steps:**
    1. Lay the package out into the tree.
    2. Run the checks of the package and the tree.
- **Readiness sign:** the layout audit is clean.
- **Verified by:** `pnpm run agent-kit:check` — exit code 0.

## What this work does not do

- The texts at the ceiling of length (`task-flow`, `task-flow-start`): task RT-2847.
- Design-tool texts: task RT-2848.
