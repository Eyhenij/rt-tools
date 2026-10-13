# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 1 — NestJS 12
- **Done:** NestJS 12.1.2 and schematics 12.0.6 are in, `@nx/nest` is gone; build, types, specs
  and lint over the tree are green, 352 of 352 tasks
- **Next step:** run the push gate set
- **Uncommitted:** folders of other tasks of the epic, not part of this branch
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Write the new versions into the root manifest and drop `@nx/nest`
- [x] 1.2 Install and run build, types, tests and lint over the tree
- [x] 1.3 Fix what NestJS 12 breaks in the servers
- [>] 1.4 Run the push gate set

## Decisions along the way

- **12.1.2 and 12.0.6 instead of 12.1.3 and 12.0.7** — on 2026-10-13 the two later releases were
  younger than a day, and pnpm wrote them into the release-age exclusions by itself. Nothing needs
  them now, so they wait for the next raise. Affected stage of the plan: 1.
- **The auth server and CMS server specs run Jest in ES module mode** — NestJS 12 ships ES modules
  only and uses `import.meta`, so the CommonJS run could not load it even through a transform. The
  test target starts Jest with `--experimental-vm-modules`, ts-jest compiles the specs as ES
  modules, and `@jest/globals` joins the root manifest for the `jest` object. Vitest was rejected:
  the packages under `projects/` run Jest by the tree's signal. Affected stage of the plan: 1.

## Findings

- The specs of the auth server and CMS server packages have type errors no target checks: a
  controller with a constructor passed where `new () => object` is expected, a `never` narrowing
  in the access spec, handler results passed where a promise is expected. The same command finds
  `@jest/globals` unresolved in the rules package specs. Not part of this work — a task of its own.

## Sessions

### 2026-10-13

- The task is taken; NestJS 12.1.2 is in. The first full run gave 350 of 352: the two server
  packages could not load NestJS 12 under CommonJS. After the switch to ES module mode — 35 of 35
  and 64 of 64 specs there, 352 of 352 over the tree.
