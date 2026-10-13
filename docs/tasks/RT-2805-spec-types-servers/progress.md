# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 1 — Spec types
- **Done:** the spec type check ends with no error in the auth server, the CMS server and the rules
  package; each of the three has a `typecheck` target; 352 of 352 tasks are green
- **Next step:** run the push gate set
- **Uncommitted:** folders of other tasks of the epic, not part of this branch
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Take the helper `refusalOf` as it is called, with a value or a promise
- [x] 1.2 Fix the media double spread and the auth server spec errors
- [x] 1.3 Fix the rules package spec error
- [>] 1.4 Run the specs of the three packages and the tree set

## Decisions along the way

- **The `typecheck` target is added to the three packages after all** — the plan left it out as a
  decision of its own, but without it the errors come back unseen: the plugin that infers the
  target looks only for Vitest configs, and these three run Jest. The target sits in each project
  file, where the plugin's rule gives the project file the last word. Affected stage of the plan: 1.
- **The `used: false` in the media spec was a dead field** — the double reads `double.used` through
  a closure, so the copy's field changed nothing; it is removed, and the spec means the same.
  Affected stage of the plan: 1.

## Sessions

### 2026-10-13

- The task is taken. Errors by the spec type check: auth server 3, CMS server 35, rules package 1;
  after the fixes 0, 0 and 0. 352 of 352 tasks, now with the three new `typecheck` targets.
