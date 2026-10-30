# Plan

**Task:** RT-3010 · **Branch:** RT-3010-kit-style-budget-mockup-measure
**Behaviour:** unchanged — only rules texts change, nothing the application or the kit draws; the owner answered «работай» on the proposal.

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                                                                                                |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Specs | none — no domain spec names these rules                                                                                              |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/mockups.md` — read, not edited                                       |
| Rules | `.claude/skills/rt-tools-styling/`, `projects/agent-kit/assets/rules/mockups.needs-mockups.md` laid out to `.claude/skills/mockups/` |
| Code  | none                                                                                                                                 |

## What counts as done

- The styling rule has an article about the application style budget, bound in its companion.
- The mockups rule measures a kit copy against the running showcase, laid out from the package.
- The checks of the rules layer are green.

## Stages

### 1. The styling article

- **Steps:**
    1. Write the article about the application style budget into the styling rule.
    2. Bind the article in the styling rule's companion.
- **Readiness sign:** the spec audit finds the article bound.
- **Verified by:** `node tools/check-specs.mjs` — exit 0 and no line naming `rt-tools-styling`.

### 2. The mockups article

- **Steps:**
    1. Rewrite the check method of the kit copy article in the package source.
    2. Build the package and lay the rule out.
- **Readiness sign:** the laid-out rule carries the new text and matches the package.
- **Verified by:** `pnpm run agent-kit:check` — the line «разложенное сходится с пакетом».

### 3. Closing

- **Steps:**
    1. Run the push set.
    2. Take the folder apart and open the PR.
- **Readiness sign:** the PR is open with the folder taken apart.
- **Verified by:** `gh pr view --json isDraft,reviewRequests` — the reviewer is set.

## What this work does not do

- The machine-local file about `--maxWorkers`: the owner did not say to edit it.
- A check that counts the style budget inside the kit: a task of its own if the owner asks.
