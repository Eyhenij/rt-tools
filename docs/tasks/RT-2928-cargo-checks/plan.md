# Plan

**Task:** RT-2928 · **Branch:** RT-2928-cargo-checks
**Spec:** `docs/specs/agent-kit/turn-guards/grill/`, `docs/specs/agent-kit/tree-assignment/`, `docs/specs/agent-kit/delivery-gate/`
**Behaviour:** changes

The agreement is written straight into the three domain specs: each edit is a new scenario of a
guard that already has a spec, and no new feature appears.

## Task footprint

| What      | Where                                                                                                                                                                                                                                                                                                                                  |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs     | `docs/specs/agent-kit/turn-guards/grill/`, `docs/specs/agent-kit/tree-assignment/`, `docs/specs/agent-kit/delivery-gate/`                                                                                                                                                                                                              |
| Rules     | `projects/agent-kit/assets/rules/task-flow.md`, `projects/agent-kit/assets/patterns/` (git-workflow-commit)                                                                                                                                                                                                                            |
| Code      | `projects/agent-kit/assets/hooks/grill-gate.sh`, `projects/agent-kit/assets/checks/tree-assignment.mjs`, `projects/agent-kit/assets/hooks/git-guard-tree-assignment.sh`, `projects/agent-kit/assets/hooks/git-guard-delivery.sh`, `projects/agent-kit/assets/checks/board.github.mjs`, `projects/agent-kit/assets/defaults/project.sh` |
| Tests     | `projects/agent-kit/tests/grill-gate.test.sh`, `projects/agent-kit/tests/guard-tree-assignment.test.sh`, a new suite for the merged branch                                                                                                                                                                                             |
| Changelog | `projects/agent-kit/CHANGELOG.md`                                                                                                                                                                                                                                                                                                      |

## What counts as done

- At the turn end, after a refused quiz in the same turn, a numbered list of two or more options
  under a line ending with a colon counts as a question to the owner, the same as a line ending
  with «?». The refusal of the quiz says the same question in prose does not walk around it.
- The refusal of the assignment check says that a message of the owner naming this work is the
  move of the assignment: the row is written with their words, and the work goes on.
- A push into a branch whose PR is merged and which has no open PR is refused before it leaves,
  with the number of the merged PR and the way out: a new branch from the fresh base.
- The four records are marked fixed in the intake.

## Stages

### 1. A list of options after a refused quiz is a question

- **Steps:**
    1. Write scenario SC-AK-1231 into the grill spec
    2. Recognise the option list in the fourth sign of `grill-gate.sh` and add the line to the quiz refusal
    3. Cover SC-AK-1231 in `grill-gate.test.sh`
- **Readiness sign:** the grill-gate suite prints no failed line, and the new cases are in it.
- **Verified by:** `bash projects/agent-kit/tests/grill-gate.test.sh` — the last line reports zero failures

### 2. The assignment refusal names the owner's word as the move

- **Steps:**
    1. Write scenario SC-AK-1232 into the tree-assignment spec
    2. Rewrite the refusal texts in `tree-assignment.mjs` and `git-guard-tree-assignment.sh`
    3. Cover SC-AK-1232 in `guard-tree-assignment.test.sh`
- **Readiness sign:** the assignment suite prints no failed line.
- **Verified by:** `bash projects/agent-kit/tests/guard-tree-assignment.test.sh` — the last line reports zero failures

### 3. A push into a merged branch is refused

- **Steps:**
    1. Write scenario SC-AK-1233 into the delivery spec
    2. Add the merged-PR reading to the board helper and the profile default
    3. Add the push refusal to the delivery guard
    4. Cover SC-AK-1233 in a suite of its own, `git-guards-merged.test.sh`
- **Readiness sign:** the new suite prints no failed line.
- **Verified by:** `bash projects/agent-kit/tests/git-guards-merged.test.sh` — the last line reports zero failures

### 4. Texts, layout and the intake

- **Steps:**
    1. Bring the pattern `git-workflow-commit` and the rule `task-flow` up to the new refusals
    2. Write the changelog entry
    3. Lay out the package and run the checks
    4. Mark the four records fixed
- **Readiness sign:** the layout check is clean, the specs check is clean.
- **Verified by:** `pnpm run agent-kit:check` — no divergence reported

## What this work does not do

- Does not judge an option list outside a turn where the quiz was refused: the proposal asked for
  a wider sign, and a wide sign on every reply with a numbered list would refuse ordinary reports.
- Does not touch the other seven records of the epic: they are task RT-2929.
