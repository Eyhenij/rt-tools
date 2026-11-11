# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Closing
- **Done:** the rule, two scenarios, the fix and the binding; the guard test 74 of 74
- **Next step:** layout and the push gate set, after the set of RT-3140 in the neighbouring copy ends
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Rule about the second working copy in the work-guard spec
- [x] 1.2 Scenarios SC-AK-1336 and SC-AK-1337 in the work-guard scenarios
- [x] 2.1 Scenarios in the guard test fail on the old code
- [x] 2.2 The profile default keeps its variables to itself and knows a second working copy
- [x] 2.3 The guard context and the merge exception resolve paths against the working copy of the call
- [x] 2.4 The guard test passes whole
- [x] 3.1 Bindings in the work-guard companion
- [>] 3.2 Layout and the push gate set
- [ ] 3.3 The task folder taken apart into the archive
- [ ] 3.4 PR into main

## Decisions along the way

- **On the old code only SC-AK-1337 fails, SC-AK-1336 passes.** The bare `root` was overwritten
  only inside the merge exception, so without a standing merge the history of the right copy was
  read. SC-AK-1336 stays as the guard of the case the owner met after the fix: an edit by a command
  with a relative path is now resolved against the copy, not against the session tree. Affected
  stage of the plan: 2.
- **An edit by a tool with the full path in a second copy was not judged at all.** The path lay
  outside the project directory, and the default answered "not application code". Now it is judged
  by the state of its copy — SC-AK-1337, the first line. Affected stage of the plan: 2.

## Sessions

### 11.11.2026

- The task is filed from a refusal met while finishing RT-3140 in a second working copy: the
  session's project directory stayed the main tree, and `rt_is_app_code_default` overwrote the
  guard's `root` with it.
