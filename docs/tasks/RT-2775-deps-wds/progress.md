# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 1 — webpack-dev-server 6
- **Done:** 6.0.0 is in for everyone, the substitution is gone; 352 of 352 tasks are green; the
  first kit showcase rises in 20 s with 106 stories
- **Next step:** run the push gate set
- **Uncommitted:** folders of other tasks of the epic, not part of this branch
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Write 6.0.0 into the root manifest and narrow the substitution to the 5.x line
- [x] 1.2 Install and run build, types, tests and lint over the tree
- [x] 1.3 Fix what webpack-dev-server 6 breaks
- [>] 1.4 Run the push gate set

## Decisions along the way

- **The substitution is removed whole, not narrowed** — after the install no 5.x copy is left in
  the lock: `@nx/webpack` declares the dev server as an optional peer `^5.0.0`, and pnpm gave it
  6.0.0 as well. A `webpack-dev-server@5` entry would match nothing, and the rule removes such
  entries. Affected stage of the plan: 1.
- **The unmet optional peer of `@nx/webpack` is accepted** — no target runs the Nx webpack dev
  server: the servers start through `@nx/js:node`, the Angular applications through
  `@angular/build`. Affected stage of the plan: 1.
- **Nothing to fix** — the full run passed, and the first kit showcase, built through webpack,
  rose on the new dev server. Affected stage of the plan: 1.

## Sessions

### 2026-10-13

- The task is taken; 6.0.0 is in. 352 of 352 tasks; the showcase on port 6006 answered
  `index.json` with 106 entries and `iframe.html` with 200, then was stopped by process id.
