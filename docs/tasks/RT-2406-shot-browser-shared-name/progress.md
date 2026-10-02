# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 1 of 1 — a default per working copy
- **Done:** the default shot container name and port come from the working copy path
- **Next step:** the folder is taken apart, the PR opens on RT-2407-ci-cache-post-step
- **Uncommitted:** the code edit and this file
- **Waiting for the owner:** no
- **PR:** not open yet; the branch stands on RT-2407-ci-cache-post-step

## Steps

- [x] 1.1 Derive the default container name and port from the working copy path in a pure function.
- [x] 1.2 `tools/shot-browser.mjs` takes its defaults from that function.

## Decisions along the way

- **The branch stands on RT-2407.** Both edit the assignment row; a branch from main would conflict with it. Affected stage of the plan: none.
- **Ports come from 44000–44999.** The pipeline's explicit port 43220 stays outside the range, so a working copy never lands on it. Affected stage of the plan: 1.

## Sessions

### 2026-10-02

- The task, the branch and the folder are created.
- Stage 1: `node tools/shot-browser-name.mjs` — «per-copy defaults ok». A live start gave `rt-tools-shot-e7d1e778` on port 44176 for this copy, and the container was removed after the command.
