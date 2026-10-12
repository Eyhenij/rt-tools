# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 1 — The style builders raised
- **Done:** task, branch, folder
- **Next step:** write the new versions
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Write the new versions of sass, postcss and autoprefixer into the root manifest
- [x] 1.2 Install, then run build, types, tests and lint over the tree
- [x] 1.3 Run the showcase frames of both kits and read every diverging frame
- [>] 1.4 Run the push gate set

## Decisions along the way

- postcss stayed on 8.5.28 after the manifest edit: the security floor `postcss: '^8.5.28'` in the
  overrides rewrites the root declaration too, and pnpm kept the locked version. The floor is
  raised to `^8.5.29`.
- Angular's build pins sass 1.104.1 and autoprefixer 10.6.0 exactly as its own dependencies; those
  copies stay, the root ones are the new versions.
- Tree run 352 of 352. Frames: the first kit 99 of 99; the second kit 781 of 781 in the first run —
  eight stories missing from the showcase index — and 789 of 789 in the rerun, no frame diverged.

## Sessions

### 2026-10-12

- Task RT-2770 taken from the epic RT-2765; the branch stands on RT-2769.
