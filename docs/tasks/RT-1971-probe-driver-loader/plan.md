# Plan

**Task:** RT-1971 · **Branch:** RT-1971-probe-driver-loader
**Behaviour:** unchanged — test tools outside the applications; the owner named work outside epics: «Задачи вне эпиков».

## Task footprint

| What | Where                                                                                                                                                        |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Code | `tools/showcase-probe.mjs`, `tools/snapshot-icon-probe.mjs`, `tools/snapshot-paint-probe.mjs`, `tools/snapshot-window-probe.mjs`, `tools/story-sweep-v2.mjs` |

## What counts as done

- `loadChromium` lives once, in `tools/showcase-probe.mjs`, and the four tools import it.

## Stages

### 1. One loader

- **Steps:**
    1. Move `loadChromium` into `tools/showcase-probe.mjs` with the refusal handed in by the caller.
    2. The four tools import it and lose their copies.
- **Readiness sign:** no copy is left and the shared loader returns the driver.
- **Verified by:** `node tools/probe-driver-check.mjs` — «one loader, driver found».

## What this work does not do

- Other ways the tree reaches the browser: the shot browser lives in a container.
