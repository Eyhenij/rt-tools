# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 1 of 1 — the upgrade
- **Done:** stage 1 — Playwright 1.63.0, seven textarea frames re-taken, both showcases green
- **Next step:** take the folder apart and open the PR
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet; the branch stands on RT-2507-stylelint-17

## Steps

- [x] 1.1 Raise `@playwright/test` to 1.63.0, drop the runner's Playwright line, rebuild the lock and
      install the browser.
- [x] 1.2 Run both showcase gates and list the diverging frames.
- [x] 1.3 Re-take the diverging second-kit frames and read each by eye.

## Decisions along the way

- **The branch stands on RT-2507.** Both edit the assignment row. Affected stage of the plan: none.

## Sessions

### 2026-10-03

- The task, the branch and the folder are created.
- Raised Playwright to 1.63.0 and dropped the runner line. `pnpm install` left the runner on
  1.62.1 from the old lock; `pnpm update playwright playwright-core` moved it, the lock holds only
  1.63.0. The shooting image is derived from the `@playwright/test` version.
- The first showcase: 99 of 99 frames match on Chromium 1.63, nothing re-taken. Its paint probe
  first failed to find `playwright`: the hoisted link was lost by `pnpm update` in this copy only;
  a fresh `pnpm install --frozen-lockfile` creates it.
- The second showcase: exactly seven textarea frames diverged. Each diff image was read by eye —
  only the resize grip in the lower right corner differs. Re-taken; a run without update gives
  746 of 746.
