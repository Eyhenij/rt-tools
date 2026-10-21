# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — A push into a merged branch is refused
- **Done:** stage 1 — SC-AK-1231 covered; stage 2 — SC-AK-1232 covered, the assignment suite 23 ok.
- **Next step:** scenario SC-AK-1233 in the delivery spec.
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
- [>] 3.1 Write scenario SC-AK-1233 into the delivery spec
- [ ] 3.2 Add the merged-PR reading to the board helper and the profile default
- [ ] 3.3 Add the push refusal to the delivery guard
- [ ] 3.4 Cover SC-AK-1233 in a suite of its own, `git-guards-merged.test.sh`
- [ ] 4.1 Bring the pattern `git-workflow-commit` and the rule `task-flow` up to the new refusals
- [ ] 4.2 Write the changelog entry
- [ ] 4.3 Lay out the package and run the checks
- [ ] 4.4 Mark the four records fixed

## Decisions along the way

- **The option-list sign lives in `grill-gate-options.sh`, its cases in `grill-gate-options.test.sh`.**
  Added in place, the guard reached 511 lines and its suite 520, over the limit of 500. Affected
  stage of the plan: 1.

## Sessions

### 2026-10-21

- The task, the branch and the folder are created; the grill-gate suite is 58 ok, the assignment
  suite 19 ok before the work.
