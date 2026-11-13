# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 2 of 2 — The heavy steps are chosen by the changed paths
- **Done:** both edits are made and their scenarios are green
- **Next step:** the owner's word about the push of this branch
- **Uncommitted:** nothing
- **Waiting for the owner:** «останавливай всё» — the set before a push is not started without their word
- **PR:** not open yet

## Steps

- [x] 1.1 Read the push guard and the run ahead
- [x] 1.2 Add the early exit to both and its scenarios
- [x] 1.3 Lay the hooks out
- [x] 2.1 Read the profile function of the set
- [x] 2.2 Choose the heavy steps by the changed paths and print the skipped ones
- [x] 2.3 Run the set on a commit of texts alone

## Decisions along the way

- **The heavy steps were already chosen by subject; what ran on a text commit was the builder** —
  `rt_push_checks` skipped frames, suites and images for texts, and still printed the three builder
  lines and the styles linter. Stage 2 removes those four for a branch of texts alone. Affected
  stage of the plan: 2.
- **Step 2.3 was read from the list the profile prints, not from a full run** — the list for the
  real text commit of this branch holds 43 light checks and no builder or heavy step. Affected
  stage of the plan: 2.
- **The new function lives in `project-texts.sh` next to the profile** — the profile stands at the
  length limit. Affected stage of the plan: 2.

## Sessions

### 2026-11-13

- The owner ordered the edits in this working copy, with no task of their own.
- A head that adds no commit to its base is let through by the guard, the run ahead and the git
  hook: 5 new scenarios, the former 84 and 42 stay green.
- A branch of texts alone gets no builder step: 5 new cases in the subject scenarios, 28 in all.
