# Grill

## The owner request

> Взять обе по очереди

The answer to the question whether to take the two tasks left over from the rules proposals:
RT-2448 first, then RT-2447. The task body: a type error in a spec of a receiver lib is caught by
no separate check, because these projects have no `typecheck` target.

## What the tree already has

- 113 projects run their specs on Vitest; 111 of them have a `tsconfig.spec.json`, the other two
  are applications with a `typecheck` target of their own.
- `pnpm exec nx show projects --with-target typecheck` lists four projects, none of them a lib.
- `check:all`, `check:affected` and the pipeline already run `typecheck` over whatever projects
  have the target, so a target given to the libs enters all three at once.
- A measurement over the 111 projects — `tsc --noEmit -p <lib>/tsconfig.spec.json --rootDir .` —
  finds 45 type errors in the specs of 22 libs. Without `--rootDir .` every lib that imports a
  neighbour fails on the root directory of its build settings instead of on types.

## What the rules already say

- `testing`: a created check goes into the push gate or the pipeline, not only into the umbrella
  target; a line is not added to a known list for a red check.
- The companion of `testing` names the libs as having no `typecheck` target.

## Questions and answers

No questions: the task names the gap, and the measurement names the work.

## Decisions

- **The target is inferred by a plugin of the tree, not written into 111 project files.** A new lib
  gets it by the same signs — a Vitest config and a spec settings file — without anybody
  remembering. Rejected: a line in every project file — a lib created later goes without it.
- **The 45 errors are fixed in the specs, not silenced.** The check is born green, with no list of
  what is allowed to stay red.
