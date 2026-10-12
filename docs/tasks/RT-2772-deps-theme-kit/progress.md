# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 1 — The kit raised in the theme and the CMS front
- **Done:** task, branch, folder
- **Next step:** the frame of the sign-in page with 0.17.0
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Take a frame of the sign-in page on the stand with 0.17.0
- [x] 1.2 Write `^0.23.3` into both manifests and install
- [x] 1.3 Run build, specs and lint of both packages
- [x] 1.4 Take the frame again with 0.23.3 and compare
- [>] 1.5 Run the push gate set

## Decisions along the way

- pnpm itself added `@rt-tools/ui-kit-v2@0.23.3` to the release-age exclusions: the version came
  out the same day, and the tree's own packages stand there the same way.
- Build, specs, types and lint of both packages green: theme specs 101 of 101, CMS front 33 of 33.
- The JAR carries kit 0.23.3: it holds the class `rt-input--appearance--pill`, which 0.17.0 has not.
- The sign-in page on the stand, measured before and after: 13 nodes — heading, fields, buttons,
  labels, link — match in place, size, font size, weight, background and rounding.

## Sessions

### 2026-10-12

- Task RT-2772 taken from the epic RT-2765; the branch stands on RT-2771.
