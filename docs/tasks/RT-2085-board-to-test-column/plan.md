# Plan

**Task:** RT-2085 · **Branch:** RT-2085-board-to-test-column
**Behaviour:** unchanged — a board setting of the tree, no application code. Подтверждено владельцем: «введи ещё одну колонку to test».

## Task footprint

| What  | Where                          |
| ----- | ------------------------------ |
| Rules | `.claude/skills/git-workflow/` |
| Code  | `.claude/rt-kit/checks.json`   |

## What counts as done

- `npm run task:move -- <номер> to-test` moves a card into «🧪 To test».
- `npm run check:board` reads the board without a refusal.

## Stages

### 1. The board config carries the new option ids and the `to-test` column

- **What is done:** `board.statusOptions` in `checks.json` rewritten with the ids GitHub issued; `to-test` added between `in-review` and `done`.
- **Readiness sign:** `task:move` prints the move into «🧪 To test», the audit prints its divergence list without an error about the board.
- **Verified by:** `npm run task:move -- 2085 to-test` — the line `#2085: … → 🧪 To test`; `npm run check:board` — the line `check-board: divergences N` without a board error.

## What this work does not do

- Does not change `tools/board.mjs` or `tools/check-board.mjs`: they read any key of the config.
- Does not touch the Deployed column: it is not in the config and never was.
- Does not restore the 756 archived closed cards: the owner left them in the archive.
