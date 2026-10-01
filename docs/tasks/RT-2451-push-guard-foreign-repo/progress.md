# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — Texts, layout and delivery
- **Done:** both guards fixed, spec and layout brought up to it
- **Next step:** take the folder apart, open the PR
- **Uncommitted:** none
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Push guard: a second copy is the same shared `.git` directory with another root; another repository is not judged
- [x] 1.2 Delivery guard: the task state and the branch form are asked of the tree of execution when it is another repository
- [x] 1.3 Tests for both guards: a real second copy refused, another repository passes
- [x] 2.1 The spec, scenarios and binding of `delivery-tree` brought up to the fix
- [x] 2.2 Changelog line, layout of the package into the tree
- [>] 2.3 Folder taken apart, push, PR into `main`, task moved to review

## Decisions along the way

- **Two step names in the plan joined into one line each.** The steps check reads a step by its
  first line, and the wrapped names did not match the progress. The wording is unchanged.
  Affected stage of the plan: 1.
- **The changelog gets no hand-written line.** The release assembles it from the commit subjects.
  Affected stage of the plan: 2.

## Sessions

### 2026-10-01

- Branch taken from `origin/main`, the assignment row of this copy names RT-2451.
- Stage 1: three suites green — push 35, delivery 98, readiness 52. The new tests fail on the
  former guards in exactly the two cases with another repository.
- Stage 2: four scenarios SC-AK-1173 to SC-AK-1176, `check:specs` exit 0, layout audit green,
  the delivery guard trimmed to the length limit.
