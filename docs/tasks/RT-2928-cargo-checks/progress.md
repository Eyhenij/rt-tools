# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Texts, layout and the intake
- **Done:** stages 1–3 — SC-AK-1231, SC-AK-1232 and SC-AK-1233 covered; the merged-branch suite 6 ok,
  the six neighbouring delivery suites green.
- **Next step:** the pattern `git-workflow-commit` and the rule `task-flow`.
- **Uncommitted:** nothing of this task.
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Write scenario SC-AK-1231 into the grill spec
- [x] 1.2 Recognise the option list in the fourth sign of `grill-gate.sh` and add the line to the quiz refusal
- [x] 1.3 Cover SC-AK-1231 in `grill-gate.test.sh`
- [x] 2.1 Write scenario SC-AK-1232 into the tree-assignment spec
- [x] 2.2 Rewrite the refusal texts in `tree-assignment.mjs` and `git-guard-tree-assignment.sh`
- [x] 2.3 Cover SC-AK-1232 in `guard-tree-assignment.test.sh`
- [x] 3.1 Write scenario SC-AK-1233 into the delivery spec
- [x] 3.2 Add the merged-PR reading to the board helper and the profile default
- [x] 3.3 Add the push refusal to the delivery guard
- [x] 3.4 Cover SC-AK-1233 in a suite of its own, `git-guards-merged.test.sh`
- [>] 4.1 Bring the pattern `git-workflow-commit` and the rule `task-flow` up to the new refusals
- [ ] 4.2 Write the changelog entry
- [ ] 4.3 Lay out the package and run the checks
- [ ] 4.4 Mark the four records fixed

## Decisions along the way

- **The option-list sign lives in `grill-gate-options.sh`, its cases in `grill-gate-options.test.sh`.**
  Added in place, the guard reached 511 lines and its suite 520, over the limit of 500. Affected
  stage of the plan: 1.
- **SC-AK-1233 lives in a subdomain of its own, `docs/specs/agent-kit/delivery-merged/`.** The
  delivery spec scenarios reached 502 lines. Affected stage of the plan: 3.
- **The host function `rt_pull_merged` is declared in `git-guard-delivery-merged.sh`, not in the
  profile defaults.** The defaults file reached 513 lines; a tree still overrides the function by its
  profile. Affected stage of the plan: 3.

## Sessions

### 2026-10-21

- The task, the branch and the folder are created; the grill-gate suite is 58 ok, the assignment
  suite 19 ok before the work.
