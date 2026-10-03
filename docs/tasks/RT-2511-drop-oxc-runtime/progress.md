# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 1 of 1 — the removal
- **Done:** stage 1 — the package is removed, every build passes
- **Next step:** take the folder apart and open the PR
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet; the branch stands on RT-2509-faker-playwright-snapshots

## Steps

- [x] 1.1 Remove `@oxc-project/runtime` from the manifest and rebuild the lock.
- [x] 1.2 Build the admin panel, the receiver, the packages and both showcases.
- [x] 1.3 If a build looks for the package, return it and write the reason.

## Decisions along the way

- **The branch stands on RT-2509.** Both edit the assignment row. Affected stage of the plan: none.

## Sessions

### 2026-10-03

- The task, the branch and the folder are created.
- Removed the package; `pnpm remove` also fixed the indentation of two script lines in the
  manifest. `nx run-many -t build --skip-nx-cache` built 11 projects, both showcase builds passed,
  and nothing under `dist` names the package. Step 1.3 had nothing to return.
