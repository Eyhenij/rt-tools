# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 6 of 6 — all stages are marked
- **Done:** all six stages; the harness shoots animations at their last frame, and ten references are re-taken
- **Next step:** the closing step — texts, the gate suite, the folder taken apart, the PR
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The package hook collects every red check and names them in one refusal
- [x] 1.2 The hook's test covers two red checks in one run
- [x] 1.3 The hook is laid out into the tree and `CLAUDE.md` says what `check:all` does not run
- [x] 2.1 The check expands `--rt-<scale>-#{$token}` over the keys of the map it walks
- [x] 2.2 The five shared names go into the accepted list with the reason of RT-383
- [x] 2.3 The token pattern names the interpolation trap
- [x] 3.1 The showcase rule says where an icon font is declared and what its class repeats
- [x] 3.2 The gate map sends `preview-head.html` and `.storybook/*.scss` to the showcase rule
- [x] 4.1 `Mobile` and `MobileActiveMenu` declare `snapshotViewport`
- [x] 4.2 Their references are re-taken, looked at and confirmed by a second raising
- [x] 4.3 The snapshot pattern names the narrow-story trap
- [x] 5.1 Every text names `pnpm run storybook:ui-kit-v1`
- [x] 5.2 The browser-verification companion says how to find who raised a showcase
- [x] 6.1 The doc-style override gets a section of its own about consumers
- [x] 6.2 The layout is checked against the package

## Decisions along the way

- **After the first red a heavy check is held, not run.** The builder, the container runner and the
  snapshot runs are heavy by the profile function `rt_push_check_heavy`: their minutes buy nothing
  when the push is refused anyway.
- **Only one interpolation at the end of a name is expanded.** The colour ramps with two
  interpolations stay unread: expanding them gives no collision with the second kit today, and a
  nested-map reader is work the ticket did not ask for.
- **Stage 4 is held, not done: the narrow reference would pin an empty menu.** With a 360×780 frame
  the menu panel came out without a single item. A probe on a copy of the harness found ten items
  in the markup at opacity 0. Storybook's test mode inserts `animation-direction: reverse` and
  `animation-play-state: paused` with `!important`. The harness then finishes every animation into
  its first frame, and the fade-in list stays transparent. Overriding the direction moves 10 of 88
  references, 8 of them outside this task, so the fix is task #2303. The stage edits were rolled
  back, and no reference was written.

## Sessions

### 2026-09-21

- Task #2302 created from the rules review of RT-2291 and taken into work; the owner allowed the
  five shared token names into the accepted list.
- The owner answered «Сделать всё в RT-2302»: #2303 is absorbed, stage 4 goes on in this branch.
- The harness returns the animation direction; 10 of 88 references diverged, each was looked at and
  re-taken file by file. The second raising matched 87 of 88: `Button › Matrix`, untouched by the
  edit, diverged by sub-pixel label glyphs and passed in both earlier full runs. The owner asked to
  stop the showcase before a third raising; the push gate shoots again.
- Stages 1, 2, 3, 5 and 6 are done. Stage 4 found that the showcase snapshots take animations at
  their first frame; it is filed as #2303, and the stage waits for it.
