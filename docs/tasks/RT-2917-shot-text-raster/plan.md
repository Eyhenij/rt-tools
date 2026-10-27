# Plan

**Task:** RT-2917 · **Branch:** RT-2917-shot-text-raster
**Behaviour:** unchanged — the owner asked for the cause of the unstable frame and a fix of the
harness; no component of either kit changes.

## Task footprint

| What  | Where                                                      |
| ----- | ---------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/snapshots/`                          |
| Laws  | `docs/constitution/verifiability.md`                       |
| Rules | `.claude/skills/testing/`                                  |
| Code  | `tools/shot-browser.mjs`, the references of both showcases |

## What counts as done

- The first-kit gate `node tools/visual-gate.mjs ui-kit` is green four runs in a row on the same
  build.
- The second-kit gate `node tools/visual-gate.mjs ui-kit-v2` is green two runs in a row.
- The companion of the rule `testing` names the text raster argument next to the other four.

## Stages

### 1. The text raster is named

- **Steps:**
    1. The argument for text anti-aliasing is added to `SHOT_ARGS` with the reason next to it.
    2. The references of the first kit are reshot: `node tools/visual-gate.mjs ui-kit --update`.
    3. The first-kit gate is run four times in a row.
- **Readiness sign:** every run prints `Snapshots: 99 passed, 99 total`.
- **Verified by:** `node tools/visual-gate.mjs ui-kit` — the line `Snapshots: 99 passed` and exit
  code 0 on each of the four runs.

### 2. The second kit is reshot

- **Steps:**
    1. The references of the second kit are reshot: `node tools/visual-gate.mjs ui-kit-v2 --update`.
    2. The changed frames are read by eye: a sample of frames with text in both themes.
    3. The second-kit gate is run twice.
- **Readiness sign:** both runs are green, and the reshot frames show the same look as before.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — the snapshots line without failures and
  exit code 0 on both runs.

### 3. Texts

- **Steps:**
    1. The companion of the rule `testing` names the new argument in the raster article.
    2. The task folder is taken apart: the grill goes to the archive.
- **Readiness sign:** the companion line names the argument; the push set is green.
- **Verified by:** `npm run check:specs` — the digest without a divergence on `testing`.

## What this work does not do

- It does not change the frames' content: a frame that differs after the reshoot by more than
  anti-aliasing is a finding and goes to the owner.
- It does not touch the harness of the second kit beyond the shared shooter.
