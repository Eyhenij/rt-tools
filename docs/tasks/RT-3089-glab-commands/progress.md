# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Closing
- **Done:** the rule, the binding and SC-AK-1262; the four guards know the glab forms; the suites
  pass (rerun 14, claim 40, waiting 46, turn-exit 111, no failures); the layout matches the package
- **Next step:** take the task folder apart into the archive record
- **Uncommitted:** none after the fix commit
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Write the rule, the binding and the scenario into the turn-claims spec
- [x] 1.2 Add the scenario lines to the four guard suites
- [x] 2.1 Add the glab forms to the four guards
- [x] 2.2 Build the package and lay it out
- [>] 3.1 Take the task folder apart into the archive record

## Decisions along the way

- **The branch stands on `RT-3091-skip-hosting-variant`** — its PR #3117 is not merged yet.
  Affected stage of the plan: none.
- **The rerun guard accepts `glab` whatever client the profile names.** A tree names one client,
  and the retry form of the other one is recognised by its own words `ci retry`, so the two never
  collide. Affected stage of the plan: none.
