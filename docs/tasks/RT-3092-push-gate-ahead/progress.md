# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — The spec, the layout and the checks
- **Done:** the helper, the guard, the run ahead, the tree opt-in, the spec subdomain, the layout; the guard suite is green, 58 of 58
- **Next step:** read the whole hook suite run, then commit and take the folder apart
- **Uncommitted:** the code, the spec, the layout and the companion line
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 A helper next to the guard: the base from the branch reflog, the mark key, reading and writing a mark
- [x] 1.2 The guard takes the base and the marks from the helper
- [x] 2.1 The command that runs the whole set ahead and writes the marks
- [x] 2.2 The guard refuses a heavy step without a mark where the tree opted in
- [x] 2.3 The tree profile opts in
- [x] 3.1 The subdomain spec with scenarios and binding
- [x] 3.2 The layout of the package into the tree
- [>] 3.3 The hook suite, the spec check and the layout audit

## Decisions along the way

- **The branch stands on RT-3041, not on main.** Creating a branch from main refused the owner's
  signature: that fix waits in #3042. Affected stage of the plan: none.
- **The result line of the guard suite moved to the end of the file.** It stood in the middle, and
  the scenarios of SC-AK-1166 below it never reached the exit code. Affected stage of the plan: 1.
- **The observations record does not make a copy dirty.** The guard writes it on every call, and a
  tree that does not ignore it would never get a mark. Affected stage of the plan: 1.
- **The auth stand counts as a heavy step in this tree.** It raises three containers and waits for
  Keycloak. Affected stage of the plan: 2.

## Sessions

### 2026-11-03

- The task assigned to treble3d and moved to In progress; the branch taken from RT-3041.
