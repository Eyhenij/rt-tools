# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Closing
- **Done:** the rule, the binding and SC-AK-1247 in the spec; three suite lines (one release, two
  refusals); the parser sign `woken_waiting` and the release in the guard; the package built and
  laid out — the guard suite 109 ok, 0 failures; `agent-kit:check` matches v0.33.1
- **Next step:** take the task folder apart into the archive record
- **Uncommitted:** none
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Write the rule, the binding and the scenario SC-AK-1247 into the spec of the guard
- [x] 1.2 Add the scenarios of the waking notification to the guard suite
- [x] 2.1 Teach the parser the waking notification and the own background tasks still running
- [x] 2.2 Release the empty turn in the guard by that sign, build the package and lay it out
- [>] 3.1 Take the task folder apart into the archive record

## Decisions along the way

- **The branch stands on `RT-2895-calendar-year-grid`** — the chain of this working copy: without
  RT-3092 under it the pre-push checks do not fit the hook limit. Affected stage of the plan: none.
- **A launch ends by any notification naming its call** — completed, failed, killed or stopped,
  whether it woke a turn or arrived as an attachment inside one. Affected stage of the plan: none.
