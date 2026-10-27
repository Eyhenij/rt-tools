# Grill

## The owner request

> Сначала найти причину

> Задача кита: задать растр текста (Рекомендую)

The pipeline on PR #2915 went red twice on the frame `Components/Button › Matrix` of the first
kit, while the branches touched no file of the first kit. The owner asked for the cause first, and
after the cause was found chose a kit task that names the text raster of the shooting browser.

## What the tree already has

- The frame is shot by the browser of the image `mcr.microsoft.com/playwright:v1.64.0-noble`;
  both architectures of the image were built on 2026-10-08, and the tag has not moved since.
- The reference `components-button--matrix.png` was shot on 2026-09-24 and has not changed.
- Between the green run of 2026-10-20 16:14Z and the red run of 2026-10-21 02:37Z not one file
  outside `projects/ui-kit-v2` and `docs` changed: `git diff --stat` between the two commits is
  empty. Both runs went on the same runner.
- Locally the first run of `node tools/visual-gate.mjs ui-kit` was red on the same frame, the
  second was green with the showcase build taken from the cache.
- The difference lies only on the edges of the letters of the «Button» labels of every second
  button in five rows: a shift test by one pixel in any direction gives ten times more differing
  pixels than no shift. The text is rasterised differently between runs with the same inputs.
- The harness already zeroes animations, waits for the fonts and shoots until two frames in a row
  match (`projects/ui-kit/.storybook/test-runner.ts`).
- `tools/shot-browser.mjs:SHOT_ARGS` names the colour profile, the software raster and whole-frame
  repainting, and names nothing about text anti-aliasing.

## What the rules already say

- Rule `testing`: the browser raster is named explicitly, otherwise a frame does not match itself.
  Its companion says the four arguments stand at launch and that without them a frame matched
  about three runs out of four.
- Rule `testing`: red has an assigned action, and a second rerun is not part of it. A line is not
  added to the known list for a red check.

## Questions and answers

**The pipeline is red on a frame the branches did not touch. How to lift the obstacle?**
Сначала найти причину

**The frame is unstable: text anti-aliasing changes between runs with the same inputs. What do we
do?**
Задача кита: задать растр текста (Рекомендую)

## Decisions

- **The text raster is named by an argument of the shooting browser, next to the four already
  named.** — the only thing left unnamed in the launch is how text is anti-aliased, and the
  difference lies on text only. Rejected: a rerun, because the cause stays; a reshoot of one
  frame, because the new reference matches one of two states and fails on the other.
- **The references of both kits are reshot after the argument, and the frames are read by eye.**
  — an argument that changes anti-aliasing changes every frame with text.

## What is left unclear

- Which argument closes the difference is found by measurement in the first stage: several runs
  of the first-kit gate after the reshoot. Nothing blocks the work by it.
