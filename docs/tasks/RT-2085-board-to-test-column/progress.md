# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этапы-кончились`
- **Stage:** 1 of 1 — the board config carries the new option ids and the `to-test` column
- **Done:** stage 1 — `checks.json` rewritten; `task:move -- 2085 to-test` printed `#2085: 🏗 In progress → 🧪 To test`; `check:board` printed `check-board: divergences 16` without a board error.
- **Next step:** take the folder apart, open the PR.
- **Uncommitted:** nothing of this task.
- **Waiting for the owner:** no
- **PR:** not open yet

## Decisions along the way

- **The board itself was restored before the config commit** — cards without a status are a board nobody can read; the config is what makes the next session able to move them. Affected stage: 1.

## Sessions

### 2026-09-14

- One file edited: `.claude/rt-kit/checks.json`. Board: 49 cards returned to their columns, 30 unarchived into To test.
- Stumbled on: `updateProjectV2Field` re-creates every option — the ids change and every card loses its status; the auto-archive workflow then archives every closed card at once.
