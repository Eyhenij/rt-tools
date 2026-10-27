# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — The text raster is named
- **Done:** the raster arguments were tried and rolled back by the owner's word «Откатить флаги,
  искать дальше (Рекомендую)»; the cause is being measured
- **Next step:** reproduce the red frame in the order the pipeline runs its steps
- **Uncommitted:** the task folder
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The argument for text anti-aliasing is added to `SHOT_ARGS` with the reason next to it.
- [x] 1.2 The references of the first kit are reshot: `node tools/visual-gate.mjs ui-kit --update`.
- [x] 1.3 The first-kit gate is run four times in a row.
- [>] 2.1 The references of the second kit are reshot: `node tools/visual-gate.mjs ui-kit-v2 --update`.
- [ ] 2.2 The changed frames are read by eye: a sample of frames with text in both themes.
- [ ] 2.3 The second-kit gate is run twice.
- [x] 3.1 The companion of the rule `testing` names the new argument in the raster article.
- [ ] 3.2 The task folder is taken apart: the grill goes to the archive.

## Decisions along the way

- **The raster arguments are rolled back.** — without subpixel positioning glyph advances round to
  whole points, 38 frames of the second kit changed size, and the second-kit gate went red twice
  after the reshoot (calendar matrix both times, table filter header once). The owner chose to roll
  back and search further. Affected stage: 1.
- **Glyph hinting stays on.** — with `--font-render-hinting=none` text narrowed, 36 frames of the
  second kit changed size and a card title moved to one line. The plan allows anti-aliasing
  changes only, so the argument was dropped and the references reshot again. Affected stage: 1.

## Sessions

### 2026-10-21

- The cause measured: same code, reference and image, green and red runs on one runner; the
  difference only on label glyph edges, no pixel shift; locally one red and one green run on the
  same cached build.
- First kit with two text arguments: 94 frames reshot, none changed size, four gate runs in a row
  print `Snapshots: 99 passed, 99 total`.
- Measurement of the first-kit gate on unchanged main: 12 runs on a cached showcase, 2 with a
  fresh build, 3 under CPU load from six busy loops, 2 with `CI=true` — all 19 print
  `Snapshots: 99 passed, 99 total`. The one red local run, 11:04 local time, went while the admin
  stand of a neighbouring tree was building.
- The pipeline's shot browser has its own container and port (`rt-tools-shot-ci`, 43220); local
  trees derive theirs from the tree path, so the two do not collide.
- Three more first-kit gate runs with ten busy loops inside the Docker machine: all three print
  `Snapshots: 99 passed, 99 total`. Load in the machine that runs the shot browser does not
  reproduce the red frame either: 22 green of 23 local runs.
- The pipeline diff of the button matrix: in every row the first button matches, and the
  buttons after it differ at glyph and pill edges. The picture reads as a fractional shift that
  grows along the row; whole-pixel comparison does not see it. Next measurement: the fractional
  left edge of every button in the matrix, compared between a green and a red run.
