# Progress: a short header panel is as high as its content

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — Closing
- **Next step:** take the task folder apart, then the PR
- **PR:** not open

## Steps

- [x] 1.1 The test SC-UKV-883 opens a panel in the mode and reads the config and the pane style.
- [x] 1.2 The directive clears the pane minimum height after each sizing.
- [x] 2.1 The agreement merges into the spec of the second kit.
- [>] 2.2 The task folder is taken apart, the PR opens.

## Decisions along the way

- None.

## Session entries

### 21.10.2026

- The task is created from a consumer's finding; the owner's word is in the grill.
- The test SC-UKV-883 was red before the fix: the pane carried `min-height: 120px`.
- The directive clears the pane minimum height after `attach`; the kit suite is green, 2943 of 2943, lint is clean.
- The agreement merged into the spec of the second kit as the subdomain `popover-short-panel`; `pnpm run check:specs` exits 0.
