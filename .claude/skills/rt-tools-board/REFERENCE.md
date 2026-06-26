# Reference — board details

## Status values

The board's Status field, in flow order:

```
🆕 New → 📋 Backlog → 🔖 Ready → 🏗 In progress → 👀 In review → ✅ Done → Deployed
```

`board.sh status <num> "<text>"` matches case-insensitively on a substring, so:

| intent      | command argument |
| ----------- | ---------------- |
| start work  | `"progress"`     |
| PR opened   | `"review"`       |
| merged/done | `"done"`         |
| shipped     | `"deployed"`     |

Ambiguous or unmatched text fails loudly rather than guessing.

## Branch slug rules

- Lowercase, words joined by `-`, ASCII only.
- Drop articles/filler; keep it to ~3–5 meaningful words from the issue title.
- Example: issue #14 "Store shouldn't return undefined values" →
  `fix/14-store-undefined-values`.

Pick the `type` from the nature of the work, matching the eventual commit type:
`feat`, `fix`, `refactor`, `docs`, `chore`, `style`, `test`, `perf`.

## Creating a task from a change already in progress

If a branch/PR exists without a task:

1. Create the issue describing the change:
   `command gh issue create --title "<title>" --body "<what & why>"`.
2. `scripts/board.sh add <issue-number>`.
3. Add `Closes #<issue-number>` to the PR body (rt-tools-ship-pr handles the body).
4. Optionally rename the branch to `type/<num>-<slug>` if it was generic:
   `command git branch -m <new-name>` (only before it has an open PR; renaming a
   pushed branch with an open PR breaks the PR — open a fresh one instead).

## Linking PR ↔ issue

- `Closes #<num>` / `Fixes #<num>` in the PR body auto-closes the issue on merge
  and moves the board item to Done via the board's built-in automation (if
  configured). Still set `"review"` explicitly when the PR opens.
- The board's **Linked pull requests** field populates automatically once the PR
  references the issue.

## Notes

- `board.sh` matches the board by title (`Rt-tools`) under the repo's own owner,
  resolved from the git remote — so it works in any clone without editing IDs.
  Override the title via `RT_BOARD_TITLE=... scripts/board.sh ...` if needed.
- If a bare `gh`/`git` errors with an account-selection message, prefix with
  `command`.
