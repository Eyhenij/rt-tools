# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 из 1 — The scroll and its test
- **Done:** the scroll, its spec and its test; the kit checks are green
- **Next step:** take the task folder apart and open the PR
- **Uncommitted:** nothing after the commit
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Write the subdomain spec with its scenarios
- [x] 1.2 Scroll the strip after the first render and on an outside change
- [x] 1.3 Cover both cases in the component test
- [>] 1.4 Run the kit linters, tests and build

## Decisions along the way

- **The tab place is measured by layout rects.** The offset parent of a tab is the strip wrapper,
  so `offsetLeft` drifted with the scroll. Affected stage of the plan: 1.

## Sessions

### 24.10.2026

- The component spec: 26 of 26 pass, the three new ones fail on the old component.
- The kit: lint and types green, 2980 of 2980 tests pass, the build passes.
