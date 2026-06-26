---
name: rt-tools-board
description: Manage the project board for this repo — every PR must map to a board task (issue). Create a tracking issue for new work or pick an existing one, branch off it as type/<num>-<slug>, add it to the board, and move its Status (In progress when work starts, In review when the PR opens). Use when asked to start a task, pick up a board item, create an issue for a change, name a feature branch by task number, or update a task's status on the board. For the push/PR/CHANGELOG step, hand off to the rt-tools-ship-pr skill.
---

# Project board workflow

Every PR is tied to exactly one board task (a GitHub issue on the board). Start
from a task, branch off it, and keep its Status in sync.

## Golden rule

No PR without a task. Either pick an existing board item or create an issue
first, then branch from it.

## Branch naming

`type/<issue-number>-<slug>` — conventional type (`feat` / `fix` / `refactor` /
`docs` / `chore` / `style`) + issue number + short kebab slug from the title.

```
feat/88-add-select-button
fix/14-store-undefined-values
```

## Helper

All board operations go through `scripts/board.sh` (resolves owner, board number
and field IDs at runtime — nothing account-specific is hardcoded):

```bash
scripts/board.sh info                    # owner, board #, status options
scripts/board.sh list                    # board items: status | type#num | title
scripts/board.sh add <num>               # add issue/PR #num to the board
scripts/board.sh status <num> "review"   # set Status (substring match)
```

## Workflow

1. **Get or create the task.**
    - Existing: `scripts/board.sh list` → pick the item, note its issue number.
    - New: `command gh issue create --title "<title>" --body "<context>"`, then
      `scripts/board.sh add <new-issue-number>`.

2. **Branch off `main`** with the naming above:

    ```bash
    command git switch main && command git pull
    command git switch -c feat/<num>-<slug>
    ```

3. **Mark In progress:** `scripts/board.sh status <num> "progress"`.

4. **Do the work and commit.** Reference the task in commits where natural.

5. **Open the PR** — hand off to the **rt-tools-ship-pr** skill (push + PR body +
   CHANGELOG). Add `Closes #<num>` to the PR body so the issue auto-closes on
   merge.

6. **Mark In review:** `scripts/board.sh status <num> "review"`.

See [REFERENCE.md](REFERENCE.md) for status names, slug rules, and edge cases.
