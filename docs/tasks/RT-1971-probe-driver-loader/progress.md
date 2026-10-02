# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 1 of 1 — one loader
- **Done:** `loadChromium` lives once, in `tools/showcase-probe.mjs`; the four tools import it
- **Next step:** the folder is taken apart, the PR opens on RT-2265-task-flow-room
- **Uncommitted:** the code edit and this file
- **Waiting for the owner:** no
- **PR:** not open yet; the branch stands on RT-2265-task-flow-room

## Steps

- [x] 1.1 Move `loadChromium` into `tools/showcase-probe.mjs` with the refusal handed in by the caller.
- [x] 1.2 The four tools import it and lose their copies.

## Decisions along the way

- **The branch stands on RT-2265.** Both edit the assignment row. Affected stage of the plan: none.
- **The check is a one-off call, not a file in `tools/`.** The plan named `node tools/probe-driver-check.mjs`; a one-off check script does not travel into the repository by the rule `ui-component-tests`. The same check runs as an inline module: it imports the shared loader and asks whether the driver has `launch`. Affected stage of the plan: 1.

## Sessions

### 2026-10-02

- The task, the branch and the folder are created.
- Stage 1: the inline check — «one loader, driver found»; `grep -rn "function loadChromium" tools` — one place; eslint over the five files — exit 0.
